export function setupSocket (io){
  // Gérer la connexion socket
io.on('connection', (socket) => {
  console.log(`✅ Utilisateur connecté:`, socket.user);

  // Joindre la room privée basée sur userId
  socket.join(socket.user.id);

  socket.on('disconnect', () => {
    console.log(`🔴 Déconnexion socket: ${socket.id}`);
  });
});

}