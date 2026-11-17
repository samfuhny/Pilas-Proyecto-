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
  function beep(f,d){try{var a=getCtx();if(!a)return;var o=a.createOscillator(),g=a.createGain();
    o.frequency.value=f;g.gain.value=.15;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}}
  function setPos(x,y){var r=stage.getBoundingClientRect();
    card.style.left=((x-r.left-off.x)/r.width*100)+'%';card.style.top=((y-r.top-off.y)/r.height*100)+'%'}

  // ===== Audio compatible con iPhone/Android/computador =====
  // iOS solo deja sonar audio si se desbloquea dentro de un gesto real (touchend / click; pointerdown NO basta).
  // Por eso: (1) desbloqueamos en varios eventos y (2) tenemos un respaldo con Web Audio (AudioContext).
  var SONIDO_URL='audio/calle-54.mp3';
  var audioListo=false,ctx=null,buffer=null;
  function getCtx(){
    if(ctx)return ctx;
    var AC=window.AudioContext||window.webkitAudioContext;
    if(AC){try{ctx=new AC()}catch(e){ctx=null}}
    return ctx;
  }
  function cargarBuffer(){
    var c=getCtx();if(!c||buffer)return;
    try{
      fetch(SONIDO_URL).then(function(r){return r.arrayBuffer()}).then(function(ab){
        return new Promise(function(ok,no){c.decodeAudioData(ab,ok,no)});
      }).then(function(b){buffer=b}).catch(function(){});
    }catch(e){}
  }
  function desbloquearAudio(){
    if(audioListo)return;
    // 1) elemento <audio>: reproducir en mudo y pausar, dentro del gesto
    try{
      paymentSound.muted=true;
      var p=paymentSound.play();
      var listo=function(){try{paymentSound.pause();paymentSound.currentTime=0}catch(e){}paymentSound.muted=false;audioListo=true};
      if(p&&typeof p.then==='function')p.then(listo,function(){paymentSound.muted=false});
      else listo();
    }catch(e){paymentSound.muted=false}
    // 2) Web Audio: reanudar el contexto y soltar un sonido vacío (truco de iOS)
    var c=getCtx();
    if(c){
      try{
        if(c.state==='suspended')c.resume();
        var s=c.createBufferSource();s.buffer=c.createBuffer(1,1,22050);s.connect(c.destination);s.start(0);
      }catch(e){}
      cargarBuffer();
    }
  }
  ['touchstart','touchend','pointerup','click','keydown'].forEach(function(ev){
    document.addEventListener(ev,desbloquearAudio,{passive:true});
  });
  try{paymentSound.load()}catch(e){}

  // Reproduce el sonido del pago; si el <audio> falla, usa Web Audio. Llama a fin() una sola vez al terminar.
  function sonarPago(fin){
    var terminado=false;
    function hecho(err){if(terminado)return;terminado=true;if(err)console.error('Sonido del pago:',err);fin()}
    function conWebAudio(){
      var c=getCtx();
      if(!c||!buffer){hecho('sin Web Audio');return}
      try{
        if(c.state==='suspended')c.resume();
        var s=c.createBufferSource();s.buffer=buffer;s.connect(c.destination);
        s.onended=function(){hecho()};s.start(0);
      }catch(e){hecho(e)}
    }
    paymentSound.addEventListener('ended',function(){hecho()},{once:true});
    paymentSound.muted=false;paymentSound.volume=1;
    try{paymentSound.currentTime=0}catch(e){}
    var pb;
    try{pb=paymentSound.play()}catch(e){conWebAudio();return}
    if(pb&&typeof pb.catch==='function')pb.catch(function(){conWebAudio()});
    setTimeout(function(){hecho()},6000); // seguro: nunca dejar la página trabada
  }

  card.addEventListener('pointerdown',function(e){
    if(busy)return;dragging=true;card.setPointerCapture(e.pointerId);
    card.classList.remove('idle');card.classList.add('drag');
    var c=card.getBoundingClientRect();off.x=e.clientX-c.left;off.y=e.clientY-c.top;
  });
  card.addEventListener('pointermove',function(e){
    if(!dragging)return;setPos(e.clientX,e.clientY);zone.classList.toggle('hot',overZone());
  });
  function release(){
    if(!dragging)return;dragging=false;card.classList.remove('drag');zone.classList.remove('hot');
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
      sonarPago(function(){soundFinished=true;continueWhenReady()});
      setTimeout(function(){waitFinished=true;continueWhenReady()},ESPERA_AL_PAGAR);
    },TIEMPO_LECTURA);
  }
  function irSiguiente(){
    stage.classList.add('sale');                       // la página sube y sale
    setTimeout(function(){location.href=PAGINA_SIGUIENTE},550);
  }
})();
