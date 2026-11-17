/* Página 3: la flecha lleva al mapa interactivo (pagina4.html) */
var PAGINA_SIGUIENTE = 'pagina4.html';

(function(){
  var btn=document.getElementById('siguiente'),stage=document.getElementById('stage'),
      animacion=document.querySelector('.animacion'),yendo=false;
  if(animacion){
    animacion.muted=true;
    animacion.loop=true;
    function reproducirAnimacion(){
      var reproduccion=animacion.play();
      if(reproduccion&&typeof reproduccion.catch==='function'){
        reproduccion.catch(function(error){console.error('No se pudo reproducir la animación:',error)});
      }
    }
    reproducirAnimacion();
  }
  btn.addEventListener('click',function(){
    if(yendo)return;yendo=true;
    var quieto=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(quieto){location.href=encodeURI(PAGINA_SIGUIENTE);return}
    stage.classList.remove('entra');stage.classList.add('sale');
    setTimeout(function(){location.href=encodeURI(PAGINA_SIGUIENTE)},550);
  });
})();
