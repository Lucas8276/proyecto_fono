document.addEventListener('DOMContentLoaded', function() {
  // Siempre limpiar el avatar al cargar el index
  sessionStorage.removeItem('selectedAvatar');

  const avatarOptions = document.querySelectorAll('.avatar-option');
  const startButton = document.getElementById('start-button');
  const mainContent = document.getElementById('main-content');
  const avatarSelection = document.getElementById('avatar-selection');
  const selectedAvatarImg = document.getElementById('selected-avatar');
  const videoContainer = document.getElementById('video-container');
  let selectedAvatar = null;

  // Al cargar, mostrar solo la selección de avatar
  avatarSelection.style.display = 'flex';
  mainContent.style.display = 'none';
  selectedAvatarImg.style.display = 'none';
  if(videoContainer) videoContainer.style.display = 'block';
  document.body.style.backgroundImage = 'none';

  avatarOptions.forEach(avatar => {
    avatar.addEventListener('click', function() {
      avatarOptions.forEach(a => a.classList.remove('selected'));
      this.classList.add('selected');
      selectedAvatar = this.src;
    });
  });

  startButton.addEventListener('click', function() {
    if (selectedAvatar) {
      sessionStorage.setItem('selectedAvatar', selectedAvatar);
      avatarSelection.style.display = 'none';
      mainContent.style.display = 'block';
      selectedAvatarImg.src = selectedAvatar;
      selectedAvatarImg.style.display = 'block';
      if(videoContainer) videoContainer.style.display = 'none';
      document.body.style.backgroundImage = "url('images/fondo/fondo inicial.svg')";
    } else {
      Swal.fire({
        title: '¡UPS!',
        text: 'POR FAVOR, SELECCIONA UN AVATAR PARA CONTINUAR',
        icon: 'warning',
        confirmButtonText: 'ENTENDIDO'
      });
    }
  });

  // Mostrar avatar si ya está seleccionado (por si recarga o vuelve)
  if(sessionStorage.getItem('selectedAvatar')) {
    selectedAvatarImg.src = sessionStorage.getItem('selectedAvatar');
    selectedAvatarImg.style.display = 'block';
    if(videoContainer) videoContainer.style.display = 'none';
    document.body.style.backgroundImage = "url('images/fondo/fondo inicial.svg')";
    avatarSelection.style.display = 'none';
    mainContent.style.display = 'block';
  }
}); 