// A máquina de dev pode ter NODE_ENV=production como variável global do
// sistema — isso faz o React carregar o build de produção dentro do Jest e
// quebra act()/render(). Forçamos 'test' antes de qualquer módulo carregar.
process.env.NODE_ENV = 'test';
