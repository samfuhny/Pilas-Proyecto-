/* Pantalla "¡Siga, siga!": la flecha lleva a la página del pago */
var PAGINA_SIGUIENTE = 'pago.html';

(function(){
  var btn=document.getElementById('siguiente'),stage=document.getElementById('stage'),yendo=false;
  btn.addEventListener('click',function(){
    if(yendo)return;yendo=true;
    var quieto=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(quieto){location.href=PAGINA_SIGUIENTE;return}
    stage.classList.add('sale');                       // sube la pantalla (animación de estilos.css)
    setTimeout(function(){location.href=PAGINA_SIGUIENTE},550);
  });
})();
