/**
 * Helper para manejar paginación por cursor
 * El cursor se basa en created_at e id para evitar duplicados
 */

/**
 * Codifica un cursor a partir de created_at e id
 * @param {Date|string} createdAt - Fecha de creación del post
 * @param {string|number} id - ID del post
 * @returns {string} Cursor codificado en base64
 */
function encodeCursor(createdAt, id) {
  if (!createdAt || !id) {
    return null;
  }
  
  // Normalizar fecha a ISO string
  const dateStr = createdAt instanceof Date ? createdAt.toISOString() : createdAt;
  
  // Crear string del cursor: "createdAt|id"
  const cursorString = `${dateStr}|${id}`;
  
  // Codificar en base64
  return Buffer.from(cursorString).toString('base64');
}

/**
 * Decodifica un cursor a created_at e id
 * @param {string} cursor - Cursor codificado
 * @returns {{createdAt: string, id: string}|null} Objeto con createdAt e id, o null si es inválido
 */
function decodeCursor(cursor) {
  if (!cursor || typeof cursor !== 'string') {
    return null;
  }
  
  try {
    // Decodificar desde base64
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    
    // Separar createdAt e id
    const parts = decoded.split('|');
    if (parts.length !== 2) {
      return null;
    }
    
    const [createdAt, id] = parts;
    
    return {
      createdAt,
      id
    };
  } catch (error) {
    // Si hay error al decodificar, retornar null
    return null;
  }
}

/**
 * Genera cursor desde un post
 * @param {Object} post - Objeto post con createdAt e id
 * @returns {string|null} Cursor codificado o null
 */
function generateCursorFromPost(post) {
  if (!post || !post.createdAt || !post.id) {
    return null;
  }
  
  return encodeCursor(post.createdAt, post.id);
}

module.exports = {
  encodeCursor,
  decodeCursor,
  generateCursorFromPost
};

