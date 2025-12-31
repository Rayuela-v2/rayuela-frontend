<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">
        {{ $t('home.hero_title_1') }} <br/>
        <span class="highlight">{{ $t('home.hero_title_2') }}</span>
      </h1>
      <p class="hero-description">
        {{ $t('home.hero_description') }}
      </p>
      <button class="cta-button" @click="scrollToProjects">{{ $t('home.start_now') }}</button>
    </div>
    <div class="hero-images">
      <img src="/rayuela_ludif.png" alt="App screenshot ludification" class="app-image image-back"/>
      <img src="/rayuela_home.png" alt="App screenshot home" class="app-image image-front"/>
    </div>
  </section>
</template>

<script setup>
const scrollToProjects = () => {
  const projectsSection = document.getElementById('projects-section');
  if (projectsSection) {
    projectsSection.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped>
.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 3rem;
  min-height: 80vh;
  flex-wrap: wrap;
}

.hero-content {
  flex: 1;
  max-width: 450px;
  text-align: left;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.hero-description {
  font-size: 1.1rem;
  color: #5a6876;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-title .highlight {
  color: #42b983; /* Un color de acento */
}

.cta-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.4);
}

.hero-images {
  flex: 1;
  position: relative;
  min-width: 500px; /* Ajustado para imágenes más grandes */
  height: 700px; /* Aumentado para dar espacio a las imágenes */
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-image {
  position: absolute;
  width: 580px; /* Imágenes más grandes */
  border-radius: 30px; /* Radio de borde ajustado */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.image-front {
  transform: rotate(5deg) translateX(60px); /* Ajuste de traslación */
  z-index: 2;
}

.image-back {
  transform: rotate(-8deg) translateX(-60px); /* Ajuste de traslación */
  z-index: 1;
}

.hero-images:hover .image-front {
  transform: rotate(2deg) translateX(30px) scale(1.05);
}

.hero-images:hover .image-back {
  transform: rotate(-4deg) translateX(-30px) scale(1.05);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
  }

  .hero-content {
    text-align: center;
    order: 2; /* El texto va después de las imágenes en móvil */
  }

  .hero-images {
    order: 1;
    height: 500px; /* Altura ajustada para tabletas */
    margin-bottom: 2rem;
    width: 100%;
    min-width: unset;
  }

  .hero-title {
    margin-top: 2.5rem;
    font-size: 2.2rem;
  }

  .app-image {
    width: 300px; /* Tamaño de imagen para tabletas */
  }

  .image-front {
    transform: rotate(5deg) translateX(40px);
  }

  .image-back {
    transform: rotate(-8deg) translateX(-40px);
  }
}

@media (max-width: 576px) {
  .hero-images {
    height: 420px; /* Menor altura para móviles */
  }

  .app-image {
    width: 240px; /* Imágenes más pequeñas para móviles */
    border-radius: 20px;
  }

  .image-front {
    transform: rotate(5deg) translateX(30px);
  }

  .image-back {
    transform: rotate(-8deg) translateX(-30px);
  }
}
</style>
