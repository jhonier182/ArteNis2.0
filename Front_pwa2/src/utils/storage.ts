/**
 * Utilidades para el manejo de almacenamiento local (localStorage/sessionStorage)
 */
class Storage {
  private isAvailable(): boolean {
    if (typeof window === 'undefined') return false
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  public get<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.isAvailable()) return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  }

  public set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  public remove(key: string): boolean {
    if (!this.isAvailable()) return false

    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }

  public clear(): boolean {
    if (!this.isAvailable()) return false

    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  }
}

export const storage = new Storage()

