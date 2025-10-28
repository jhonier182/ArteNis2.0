/**
 * Script simple para verificar la conexión al backend
 */
const http = require('http');

const API_URL = process.env.API_URL || 'http://192.168.1.2:3000/api';
const HOST = API_URL.replace('http://', '').split('/')[0];
const PORT = HOST.split(':')[1] || 3000;
const PATH = API_URL.split('/api')[1] || '/';

console.log('🔍 Verificando conexión al backend...');
console.log(`URL: ${API_URL}`);
console.log(`Host: ${HOST}`);
console.log(`Puerto: ${PORT}`);

const options = {
  hostname: HOST.split(':')[0],
  port: PORT,
  path: '/api/health', // Asumiendo que existe un endpoint de health
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  console.log(`\n✅ Conexión exitosa!`);
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n📦 Respuesta:`, data);
  });
});

req.on('error', (e) => {
  console.log(`\n❌ Error de conexión: ${e.message}`);
  console.log('\n📝 Posibles causas:');
  console.log('1. El backend no está corriendo');
  console.log('2. La URL está incorrecta');
  console.log('3. Hay un firewall bloqueando la conexión');
  console.log('\n💡 Para iniciar el backend: cd Backend && npm start');
});

req.on('timeout', () => {
  console.log('\n⏱️ Timeout: El backend no responde');
  req.destroy();
});

req.end();

