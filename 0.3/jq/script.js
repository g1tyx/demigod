var version = "0.3";
var savefile_name = "demigod"+version;

var debug_nosave=0;

var diff = 0;
var date = Date.now();
var player = {
  start:0,
  time:0,
  system_frame:0,
  seen:{
    hammer:0,
    hammer_hint:0,
    hammer2:0,
    resolve:0,
    wormhole:0
  },
  undo_point:0
};

//values preserved between prestige cycles
var prestige = {
  offline:1,
  multiplier:1,
  all_time_counter:0,
  universes:0
};
var settings = {
  scientific:0,
  audio_mute:0,
  audio_volume:0.5
}
var civ = {};


//variables that are constants, unsaved defaults or are derived from saved variables
const SYSTEMFRAME_MAX = 1e2;
const BASE_COST = 10;
var nextEuroCost=0;
var current_rate;
var galaxy_rate=[0,0,0,0];
var planets_num;
var galaxies_num;
var solarsystems_num;
var target=100;
var misc_settings={
  settings_toggle:0,
  save_del_confirm_toggle:0,
  notification_flag:0,
  undo_counter:0
}
var session_data={
  //session data is not saved
  counter:0,
  main_loop:null,
  audio_initiated:0,
  click1:0,
  click2:0,
  click3:0,
  save_frame:0
};
var notifications={
  hammer_hint:'Notice that the multiplier button now shows a number. It indicates the minimum amount of the counter at which hitting the multiplier will reach the target.',
  hammer2:'The second button works the same as the first one, but also if you reach the target without using it, its multiplier will increment. This way if you come after a long period of idle play, it will accumulate a high multiplier.<br><br>The first indicator on this button works the same way. But the bottom indicator shows a number that the counter would need to reach in order to hit the target using both buttons.',
  resolve:'If you get softlocked when using the multiplier buttons prematurely, Resolve is your way out.<br><br>Don\'t worry about hitting the button by mistake, unless at least on of the multiplier buttons is inactive, Resolve won\'t do anything.',
  wormhole:'If you get softlocked when using the multiplier buttons prematurely and there are no other ways to get out, the Wormhole appears. It allows you to travel back in time and undo the horrible mistake that has left you stranded in the void.<br><br>However, if you need to wait less than 60 seconds to reach the target, the Wormhole won\'t spend its valuable time saving you: you\'ll have to wait!'
}




function init(){

}
function commonInit(){
  //inits that are relevant to both init() and loadGame()
  Howler.volume(settings.audio_volume);//default volume
}
function setupCiv(){

  civ={
    counter:0,
    num:0,
    target:0,
    base_target:1e1,
    growth_rate:1.02,
    hammer:1,
    hammer2:1,
    hammer2_factor:0,
    hammer3:1,
    hammer3_factor:0,
    civ_buffs:[0,0,0,0,0,0,0,0,0,0],
    planet_buffs:[0,0,0,0,0,0,0,0,0,0],
    solar_buffs:[0,0,0,0,0,0,0,0,0,0],
    galaxy_buffs:[0,0,0,0,0,0,0,0,0,0],
    hammer2_trigger:6,
    hammer3_trigger:16
  };

  rateCalc();

}

//main loop
function loop() {
    diff = Date.now()-date;
    calc(diff/1000);
    date = Date.now();
}
function calc(dt){

  civ.counter+=dt*current_rate;

  if(civ.counter>=target){

    civ.num++;
      if(solarsystems_num>=5 && getRandomInt(0,10)==5){civ.civ_buffs[civ.num%10]=1;}
      if(galaxies_num>0 && solarsystems_num>=5 && getRandomInt(0,10)==5){civ.planet_buffs[planets_num%10-1]=1;}
      if(galaxies_num>0 && solarsystems_num>=17 && getRandomInt(0,30)==5){
        civ.solar_buffs[solarsystems_num%10-1]=1;
      }
      if(galaxies_num>0 && getRandomInt(0,30)==5){
        for (let i = 0; i <  galaxies_num; i++) {
          if(civ.galaxy_buffs[i]==0){civ.galaxy_buffs[i]=1;break;}
        }
        
      }

    civ.counter=0;
    civ.hammer=1;
    if(solarsystems_num>=civ.hammer2_trigger && civ.hammer2==1){civ.hammer2_factor+=1+galaxies_num;}
    else{civ.hammer2=1;}
    if(solarsystems_num>=civ.hammer3_trigger && galaxies_num>0 && civ.hammer3==1){civ.hammer3_factor+=1+galaxies_num;}
    else{civ.hammer3=1;}
    
    setTimeout(function (){playAudio(3);}, 100);

    hammer.prop('disabled', false);
    buyRecalc();
  }

  player.system_frame+=1;
  if(player.system_frame>SYSTEMFRAME_MAX){
    player.system_frame=0;
    if(debug_nosave==0){saveGame();}
  }

  updateCounter(current_rate);

}
function updateCounter(current_rate){

  //storeState();

  if(civ.counter<1000){
    main_counter_label.text( parseFloat(civ.counter).toFixed(0) );
  }else{main_counter_label.text(numT(civ.counter));}

  main_rate_label.text(numT(current_rate)+'/s');

}

function buyRecalc(){


  rateCalc();
  refreshUI();

};
function rateCalc(){

  planets_num=Math.floor(civ.num/10);
  solarsystems_num=Math.floor(civ.num/100);
  galaxies_num=Math.floor(civ.num/1000);

  target=getTarget();

  current_rate=1;

  galaxy_rate[0]=0.1;
  galaxy_rate[1]=(0.5+0.1*solarsystems_num);
  galaxy_rate[2]=Math.pow(2,solarsystems_num);
  galaxy_rate[3]=Math.pow(100,galaxies_num);

  current_rate*=1+galaxy_rate[0]*civ.num;

  current_rate*=1+galaxy_rate[1]*planets_num;

  current_rate*=galaxy_rate[2];

  current_rate*=galaxy_rate[3];

  current_rate*=Math.pow(2,prestige.universes);

  if(galaxies_num>=10){
    prestige.universes++;
    setupCiv();
  }
  

}
function refreshUI(){


  //footer

  if(misc_settings.settings_toggle==0){settings_block.hide();}else{
    settings_block.show();

    if(misc_settings.save_del_confirm_toggle==0){save_del_confirm_block.hide();}
    else{save_del_confirm_block.show();}

    if(settings.audio_mute==1){
      button_audio.text("Turn it back on");
    }else{
      button_audio.text("Turn it off");
    }

    audio_control_volume.val(settings.audio_volume);
  }


  //notification
  if(player.seen.hammer_hint==1){
    notification.show().html('<b>Hint</b><br><br>' + notifications['hammer_hint']);
    notification.append('<br><br><button id="close_notification" class="notification_close">Close</button>');

    close_notification=$('#close_notification');
    close_notification.click(function(){
      playAudio(1);
      player.seen.hammer_hint=2;
      refreshUI();
    });

  }
  else if(player.seen.hammer2==1){
    notification.show().html('<b>Hint</b><br><br>' + notifications['hammer2']);
    notification.append('<br><br><button id="close_notification" class="notification_close">Close</button>');

    close_notification=$('#close_notification');
    close_notification.click(function(){
      playAudio(1);
      player.seen.hammer2=2;
      refreshUI();
    });

  }
  else if(player.seen.resolve==1){
    notification.show().html('<b>Hint</b><br><br>' + notifications['resolve']);
    notification.append('<br><br><button id="close_notification" class="notification_close">Close</button>');

    close_notification=$('#close_notification');
    close_notification.click(function(){
      playAudio(1);
      player.seen.resolve=2;
      refreshUI();
    });

  }

  else if(player.seen.wormhole==1){
    notification.show().html('<b>Hint</b><br><br>' + notifications['wormhole']);
    notification.append('<br><br><button id="close_notification" class="notification_close">Close</button>');

    close_notification=$('#close_notification');
    close_notification.click(function(){
      playAudio(1);
      player.seen.wormhole=2;
      refreshUI();
    });

  }

  else{notification.hide();}



  main_target_label.text('Target: ' + numT(target));

  universe_title.html('<span class="civ'+(prestige.galaxies+1)+'">Galaxy '+romanize(galaxies_num+1)+'</span>');


  //undo
  if(areHammersOff() && !inArray(1,civ.galaxy_buffs) && (target-civ.counter)/current_rate>60){
    undo_button.show();

    if(player.seen.wormhole==0){
      player.seen.wormhole=1;
      refreshUI();
    }
  }
  else{undo_button.hide();}





  //hammers

  hammer.show();



  if(target>150000){
    if(player.seen.hammer_hint==0){
      player.seen.hammer_hint=1;
      refreshUI();
    }
    hammer.html('x'+(2+solarsystems_num)+'<hr><span class="tinier">'+(numT(target/(2+solarsystems_num)))+'</span>');
  }else{
    hammer.html('x'+(2+solarsystems_num));
  }


  

  if(civ.hammer==0){hammer.prop('disabled', true);}
  else{hammer.prop('disabled', false);}
  

  

  if(solarsystems_num<civ.hammer2_trigger){hammer2.hide();}
  else{
    hammer2.show();

    if(player.seen.hammer2==0){
      player.seen.hammer2=1;
      refreshUI();
    }

    if(civ.hammer2==0){hammer2.prop('disabled', true);}
    else{hammer2.prop('disabled', false);}

    hammer2.html('x'+(2+solarsystems_num+civ.hammer2_factor)+'<hr><span class="tinier">'+(numT(target/(2+solarsystems_num+civ.hammer2_factor)))+'</span><hr><span class="tinier">'+(numT(target/(2+solarsystems_num+civ.hammer2_factor)/(2+solarsystems_num)))+'</span>');


  }

  if(solarsystems_num>=civ.hammer3_trigger && galaxies_num>0){
    hammer3.show();

    if(civ.hammer3==0){hammer3.prop('disabled', true);}
    else{hammer3.prop('disabled', false);}

    hammer3.html('x'+(2+solarsystems_num+civ.hammer3_factor)+'<hr><span class="tinier">'+(numT(target/(2+solarsystems_num+civ.hammer3_factor)))+'</span><hr><span class="tinier">'+(numT(target/(2+solarsystems_num+civ.hammer3_factor)/(2+solarsystems_num+civ.hammer2_factor)/(2+solarsystems_num)))+'</span>');


  }else{
    hammer3.hide();
  }





  //entities

  if(civ.num==0){entities_block.hide();}
  else{
    entities_block.show();

    uni_contributions_block.html('');

    entities_list.html('');

    for (let i = 0; i < civ.num%10; i++) {

      let buff='';

      if(civ.civ_buffs[i]==1){ buff='<hr><div id="c'+i+'" class="buff4_tech">&uarr;</div>'; }
      
      entities_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Civilization '+romanize(i+1)+'</span><hr>+'+numT(galaxy_rate[0]*100)+'%'+buff+'</button>');
      
    }

    uni_contributions_block.append('Civilizations: <b>+'+numT(galaxy_rate[0]*100*civ.num)+'%</b>');

    all_buff4_tech=$('.buff4_tech');

    all_buff4_tech.click(function(){
      var id = parseInt($(this).attr('id').slice(1));
      playAudio(2);
      civ.counter=target;
      civ.civ_buffs[id]=0;
      refreshUI();
    });



    if(civ.num>=10){

      entities_list.append('<br><br><br><br>');

      for (let i = 0; i < planets_num%10; i++) {

        let buff='';

        if(civ.planet_buffs[i]==1){ buff='<hr><div id="p'+i+'" class="buff5_tech">&uarr;</div>'; }

        entities_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Planet '+romanize(i+1)+'</span><hr>+'+numT(galaxy_rate[1]*100)+'%<hr>10 Civilizations'+buff+'</button>');

      }

      uni_contributions_block.append('<br>Planets: <b>+'+numT(galaxy_rate[1]*100*planets_num)+'%</b>');

      all_buff5_tech=$('.buff5_tech');

      all_buff5_tech.click(function(){
        var id = parseInt($(this).attr('id').slice(1));
        playAudio(2);
        civ.num+=10;
        civ.counter=target;
        civ.planet_buffs[id]=0;
      });

    }

    

    if(civ.num>=100){

      entities_list.append('<br><br><br><br>');

      for (let i = 0; i < solarsystems_num%10; i++) {

        let buff='';

        if(civ.solar_buffs[i]==1){ buff='<hr><div id="p'+i+'" class="buff6_tech">&uarr;</div>'; }

        entities_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Solar System '+romanize(i+1)+'</span><hr>x2<hr>10 Planets'+buff+'</button>');

      }

      uni_contributions_block.append('<br>Solar Systems: <b>x'+numT(galaxy_rate[2])+'</b>');

      all_buff6_tech=$('.buff6_tech');

      all_buff6_tech.click(function(){
        var id = parseInt($(this).attr('id').slice(1));
        playAudio(2);
        civ.num+=100;
        civ.counter=target;
        civ.solar_buffs[id]=0;

      });


    }


  }

  
  if(galaxies_num==0){galaxies_block.hide();}
  else{

    galaxies_block.show();


    galaxies_list.html('');

    for (let i = 0; i < galaxies_num; i++) {

      let buff='';

      if(civ.galaxy_buffs[i]==1){
        buff='<hr><div id="g'+i+'" class="buff7_tech">Resolve</div>';

        if(player.seen.resolve==0){
          player.seen.resolve=1;
        }
      }

      galaxies_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Galaxy '+romanize(i+1)+'</span><hr>x100'+buff+'</button>');
    }

    all_buff7_tech=$('.buff7_tech');

    all_buff7_tech.click(function(){
      if(civ.hammer==1 && civ.hammer2==1 && civ.hammer3==1){return;}
      var id = parseInt($(this).attr('id').slice(1));
      playAudio(2);
      civ.counter=target;
      civ.galaxy_buffs[id]=0;
    });


  }
  

  if(prestige.universes==0){universes_block.hide();}
  else{

    universes_block.show();


    universes_list.html('');

    for (let i = 0; i < prestige.universes; i++) {
      universes_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Universe '+romanize(i+1)+'</span><hr>x2</button>');
    }


  }


  //all_button1_tech=$(".button1_tech");
  /*all_button1_tech.click(function(){
    playAudio(2);
  });*/


}






function saveGame(){

  player.time=Date.now();

  let gameData = {
      universal:[player,prestige,settings],
      entities:[civ]
    };

    gameData=LZString.compressToBase64(JSON.stringify(gameData));
    localStorage.setItem(savefile_name, gameData);
}
function loadGame(){
  let gameData=localStorage.getItem(savefile_name);
  gameData = JSON.parse(LZString.decompressFromBase64(gameData));

    player=gameData.universal[0];
    prestige=gameData.universal[1];
    settings=gameData.universal[2];

    civ=gameData.entities[0];


    //backwards compatibility
    if(typeof player.seen.wormhole === 'undefined'){player.seen.wormhole=0;}
    if(typeof player.undo_point === 'undefined'){player.undo_point=0;}
    civ.hammer3_trigger=16;
    ///////////////////////////////^^^backwards compatibility

    rateCalc();


    //offline progress
    if(prestige.offline==1){
      if(player.time>0){
        diff = Date.now()-player.time;
        calc(diff/1000);
      }
    }

    

}
function delSave(){
  localStorage.removeItem(savefile_name);
}


function getTarget(){

  return civ.base_target * Math.pow(civ.growth_rate,civ.num) * (Math.pow(civ.growth_rate,1)-1) / (civ.growth_rate-1);

}
function areHammersOff(){

  let check=[0,0,0];
  
  if(civ.hammer==1){check[0]=1;}

  //hammer2 is available
  if(solarsystems_num>=civ.hammer2_trigger){
    if(civ.hammer2==1){check[1]=1;}
  }

  //hammer3 is available
  if(solarsystems_num>=civ.hammer3_trigger && galaxies_num>0){
    if(civ.hammer3==1){check[2]=1;}
  }

  if(check[0]+check[1]+check[2]>0){return false;}
  else return true;

}

function numT(number, decPlaces=2){

  //numTransform

  //my optimization: it used to do abbrev.length in two places, since the length here is not variable, I cache it. Performance boost is likely to be very small, but as this is one of the most used functions in the game, I want to make sure it is ultra-optimized

  if(settings.scientific==0){

  var abbrev_length=74;

          number = Math.round(number*100)/100;//my addition: round any incoming floats first

          // 2 decimal places => 100, 3 => 1000, etc
          decPlaces = Math.pow(10,decPlaces);
          // Enumerate number abbreviations
          var abbrev = [ "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "Qt", "Qd", "Sd", "St", "O", "N", "c", "kc", "d", "kd", "e", "ke", "f", "kf", "h", "kh", "i", "ki", "j", "kj", "L", "kL", "Na", "kNa", "Nb", "kNb", "Nc", "kNc", "Nd", "kNd", "Ne", "kNe", "Nf", "kNf", "Ng", "kNg", "Nh", "kNh", "Ni", "kNi", "Nj", "kNj", "Nk", "kNk", "Nl", "kNl", "Nm", "kNm", "Np", "kNp", "Nq", "kNq", "Nr", "kNr", "Ns", "kNs", "Nt", "kNt", "Nu", "kNu" ];

          // Go through the array backwards, so we do the largest first
          for (var i=abbrev_length-1; i>=0; i--) {
              // Convert array index to "1000", "1000000", etc
              var size = Math.pow(10,(i+1)*3);
              // If the number is bigger or equal do the abbreviation
              if(size <= number) {
                   // Here, we multiply by decPlaces, round, and then divide by decPlaces.
                   // This gives us nice rounding to a particular decimal place.
                   number = Math.round(number*decPlaces/size)/decPlaces;
                   // Handle special case where we round up to the next abbreviation
                   if((number == 1000) && (i < abbrev_length - 1)) {
                       number = 1;
                       i++;
                   }
                   // Add the letter for the abbreviation
                   number += ""+abbrev[i];
                   // We are done... stop
                   break;
              }
          }

        }else{
          if(number>=1000){return Number(number).toExponential(2).replace(/\+/g, "");}
          else{number = Math.round(number*100)/100;}
        }

          return number;
}
function numT2(number){
  if(number>1000){return Number(number).toExponential(3);}
  else{number = Math.round(number*1000)/1000;}
  return number;
}
function romanize(number){
  if (!+number)
    return false;
  var	digits = String(+number).split(""),
    key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
           "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
           "","I","II","III","IV","V","VI","VII","VIII","IX"],
    roman = "",
    i = 3;
  while (i--)
    roman = (key[+digits.pop() + (i * 10)] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;
}


function choose(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum and the minimum are inclusive
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}
function inArray(value,array){

  for (let i = 0; i < array.length; i++) {
    if(value==array[i]){return true;}
  }
  return false;
}

function setCivs(num){
  civ.num=num;
  buyRecalc();
}

function setupAudio(){

  session_data.click1 = new Howl({
    src: ['snd/click1.wav'],
    volume: 0.5
  });

  session_data.click2 = new Howl({
    src: ['snd/click2.wav']
  });

  session_data.click3 = new Howl({
    src: ['snd/click3.wav'],
    volume: 0.5
  });

}
function playAudio(snd){

  if(session_data.audio_initiated==0){
    session_data.audio_initiated=1;
    setupAudio();
  }

  if(settings.audio_mute==0){
		switch(snd){
			case 1: session_data.click1.play(); break;
			case 2: session_data.click2.play(); break;
			case 3: session_data.click3.play(); break;
      case 4: session_data.click2.rate(getRandomInt(0.8,2)); session_data.click2.play(); break;
			}
	}
}
