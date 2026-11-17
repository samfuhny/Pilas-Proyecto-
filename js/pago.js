/* Lógica de la página 1: arrastrar la tarjeta y simular el pago */

// ===== Configuración (lo que probablemente quieras cambiar) =====
var PAGINA_SIGUIENTE = 'pagina2.html'; // a dónde va después del pago
var TIEMPO_LECTURA   = 1100;           // ms que "lee" la tarjeta
var ESPERA_AL_PAGAR  = 1500;           // ms que se ve la confirmación antes de pasar
// ================================================================

(function(){
  var stage=document.getElementById('stage'),card=document.getElementById('card'),
      zone=document.getElementById('zone'),starTxt=document.getElementById('starTxt'),
      paymentSound=document.getElementById('paymentSound');
  var HOME={left:'66%',top:'71%'},dragging=false,off={x:0,y:0},busy=false;

  function overZone(){
    var c=card.getBoundingClientRect(),z=zone.getBoundingClientRect();
    return Math.hypot(c.left+c.width/2-(z.left+z.width/2),c.top+c.height/2-(z.top+z.height/2))<z.width*0.5;
  }
  function beep(f,d){try{var a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();
    o.frequency.value=f;g.gain.value=.15;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}}
  function setPos(x,y){var r=stage.getBoundingClientRect();
    card.style.left=((x-r.left-off.x)/r.width*100)+'%';card.style.top=((y-r.top-off.y)/r.height*100)+'%'}

  // En celular el navegador solo deja reproducir audio si el primer play() ocurre
  // dentro de un toque del usuario. Aquí "desbloqueamos" el sonido en silencio.
  var audioDesbloqueado=false;
  function desbloquearAudio(){
    if(audioDesbloqueado)return;
    audioDesbloqueado=true;
    paymentSound.muted=true;
    var p=paymentSound.play();
    if(p&&typeof p.then==='function'){
      p.then(function(){paymentSound.pause();paymentSound.currentTime=0;paymentSound.muted=false})
       .catch(function(){paymentSound.muted=false;audioDesbloqueado=false});
    }else{paymentSound.pause();paymentSound.muted=false}
  }

  card.addEventListener('pointerdown',function(e){
    if(busy)return;desbloquearAudio();dragging=true;card.setPointerCapture(e.pointerId);
    card.classList.remove('idle');card.classList.add('drag');
    var c=card.getBoundingClientRect();off.x=e.clientX-c.left;off.y=e.clientY-c.top;
  });
  card.addEventListener('pointermove',function(e){
    if(!dragging)return;setPos(e.clientX,e.clientY);zone.classList.toggle('hot',overZone());
  });
  function release(){
    if(!dragging)return;desbloquearAudio();dragging=false;card.classList.remove('drag');zone.classList.remove('hot');
    if(overZone()){pagar()}else{card.style.left=HOME.left;card.style.top=HOME.top;card.classList.add('idle')}
  }
  card.addEventListener('pointerup',release);card.addEventListener('pointercancel',release);

  function pagar(){
    busy=true;card.classList.add('locked');
    card.style.left='38%';card.style.top='44%';
    starTxt.textContent='Leyendo…';beep(660,.08);
    setTimeout(function(){
      stage.classList.add('done');
      starTxt.textContent='¡Transferencia realizada!';
      card.style.left='66%';card.style.top='80%';
      var soundFinished=false,waitFinished=false;
      function continueWhenReady(){
        if(soundFinished&&waitFinished)irSiguiente();
      }
      function finishSound(error){
        if(soundFinished)return;
        soundFinished=true;
        if(error)console.error('No se pudo reproducir el sonido del pago:',error);
        continueWhenReady();
      }
      paymentSound.addEventListener('ended',function(){finishSound()}, {once:true});
      paymentSound.addEventListener('error',function(){finishSound(paymentSound.error)}, {once:true});
      paymentSound.currentTime=0;
      var playback=paymentSound.play();
      if(playback&&typeof playback.catch==='function')playback.catch(finishSound);
      setTimeout(function(){waitFinished=true;continueWhenReady()},ESPERA_AL_PAGAR);
    },TIEMPO_LECTURA);
  }
  function irSiguiente(){
    stage.classList.add('sale');                       // la página sube y sale
    setTimeout(function(){location.href=PAGINA_SIGUIENTE},550);
  }
})();