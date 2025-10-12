const EventEmitter = require('events');

class TaskQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.queue = [];
    this.processing = false;
    this.maxConcurrency = options.maxConcurrency || 5;
    this.activeTasks = new Set();
    this.priorityLevels = {
      'critical': 0,
      'high': 1,
      'normal': 2,
      'low': 3
    };
  }

  // Agregar tarea a la cola
  async add(task, priority = 'normal') {
    return new Promise((resolve, reject) => {
      const queueTask = {
        id: Date.now() + Math.random(),
        task,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      };

      // Insertar según prioridad
      this.insertByPriority(queueTask);
      
      // Emitir evento
      this.emit('taskAdded', queueTask);
      
      // Procesar si no está en proceso
      if (!this.processing) {
        this.process();
      }
    });
  }

  // Insertar tarea según prioridad
  insertByPriority(newTask) {
    const priority = this.priorityLevels[newTask.priority];
    
    for (let i = 0; i < this.queue.length; i++) {
      if (this.priorityLevels[this.queue[i].priority] > priority) {
        this.queue.splice(i, 0, newTask);
        return;
      }
    }
    
    this.queue.push(newTask);
  }

  // Procesar cola
  async process() {
    if (this.processing) return;
    
    this.processing = true;
    
    while (this.queue.length > 0 && this.activeTasks.size < this.maxConcurrency) {
      const queueTask = this.queue.shift();
      this.activeTasks.add(queueTask.id);
      
      // Procesar tarea de forma asíncrona
      this.executeTask(queueTask);
    }
    
    this.processing = false;
  }

  // Ejecutar tarea
  async executeTask(queueTask) {
    try {
      // Usar setImmediate para evitar bloqueos
      setImmediate(async () => {
        try {
          const result = await queueTask.task();
          queueTask.resolve(result);
          
          // Emitir evento de éxito
          this.emit('taskCompleted', {
            id: queueTask.id,
            duration: Date.now() - queueTask.timestamp
          });
        } catch (error) {
          queueTask.reject(error);
          
          // Emitir evento de error
          this.emit('taskError', {
            id: queueTask.id,
            error: error.message,
            duration: Date.now() - queueTask.timestamp
          });
        } finally {
          this.activeTasks.delete(queueTask.id);
          
          // Continuar procesando si hay más tareas
          if (this.queue.length > 0) {
            this.process();
          }
        }
      });
    } catch (error) {
      queueTask.reject(error);
      this.activeTasks.delete(queueTask.id);
    }
  }

  // Obtener estadísticas de la cola
  getStats() {
    return {
      queueLength: this.queue.length,
      activeTasks: this.activeTasks.size,
      maxConcurrency: this.maxConcurrency,
      processing: this.processing
    };
  }

  // Limpiar cola
  clear() {
    this.queue.forEach(task => {
      task.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.activeTasks.clear();
    this.processing = false;
  }
}

// Singleton instance
const taskQueue = new TaskQueue({
  maxConcurrency: 3 // Limitar concurrencia para evitar sobrecarga
});

module.exports = taskQueue;
