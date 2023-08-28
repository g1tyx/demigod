var version = "0.2";
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
    hammer2:0
  }
};

//values preserved between prestige cycles
var prestige = {
  offline:0,
  multiplier:1,
  all_time_counter:0,
  galaxies:0,
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
const EUROS_BASE_COST = 1e6;
var nextEuroCost=0;
var current_rate;
var galaxy_rate=[0,0,0];
var target=100;
var misc_settings={
  settings_toggle:0,
  save_del_confirm_toggle:0
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
    target:1e2,
    hammer:1,
    hammer2:1,
    hammer2_factor:0,
    hammer3:1,
    hammer3_factor:0
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
    civ.counter=0;
    civ.hammer=1;
    if(civ.hammer2==1){civ.hammer2_factor++;}
    else{civ.hammer2=1;}
    if(civ.hammer3==1){civ.hammer3_factor++;}
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

  current_rate=1;

  target=(civ.target+civ.num)*Math.pow(1.95,prestige.galaxies);

  galaxy_rate[0]=0.1*civ.num;
  galaxy_rate[1]=0.1*Math.floor(civ.num/10);
  galaxy_rate[2]=Math.pow(2,Math.floor(civ.num/100));

  current_rate*=1+galaxy_rate[0];

  current_rate*=1+galaxy_rate[1];

  current_rate*=galaxy_rate[2];

  current_rate*=Math.pow(2,prestige.galaxies);

  current_rate*=Math.pow(2,prestige.universes);

  if(current_rate>target){
    prestige.galaxies++;
    if(prestige.galaxies>=10){
      prestige.galaxies=0;
      prestige.universes++;
    }
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

  



  main_target_label.text('Target: ' + numT(target));

  universe_title.html('<span class="civ'+(prestige.galaxies+1)+'">Galaxy '+romanize(prestige.galaxies+1)+'</span>');



  if(prestige.galaxies<0){hammer.hide();}
  else{

    hammer.show();
    hammer.text('x'+(2+prestige.galaxies));

    if(civ.hammer==0){hammer.prop('disabled', true);}
    else{hammer.prop('disabled', false);}
  }

  

  if(prestige.galaxies<2){hammer2.hide();}
  else{
    hammer2.show();

    if(civ.hammer2==0){hammer2.prop('disabled', true);}
    else{hammer2.prop('disabled', false);}

    hammer2.text('x'+((prestige.galaxies)+civ.hammer2_factor));


  }

  /*
  if(prestige.galaxies<4){hammer3.hide();}
  else{
    hammer3.show();

    if(civ.hammer3==0){hammer3.prop('disabled', true);}
    else{hammer3.prop('disabled', false);}

    hammer3.text('x'+((prestige.galaxies-1)+civ.hammer3_factor));


  }
  */
  hammer3.hide();



  if(civ.num==0){entities_block.hide();}
  else{
    entities_block.show();

    uni_contributions_block.html('');

    entities_list.html('');

    for (let i = 0; i < civ.num%10; i++) {
      entities_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Civilization '+romanize(i+1)+'</span><hr>+10%</button>');
    }

    uni_contributions_block.append('Civilizations: <b>+'+numT(galaxy_rate[0]*100)+'%</b>');



    if(civ.num>=10){

      entities_list.append('<br><br><br><br>');

      for (let i = 0; i < Math.floor(civ.num/10)%10; i++) {
        entities_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Planet '+romanize(i+1)+'</span><hr>+10%<hr>10 Civilizations</button>');
      }

      uni_contributions_block.append('<br>Planets: <b>+'+numT(galaxy_rate[1]*100)+'%</b>');

    }

    

    if(civ.num>=100){

      entities_list.append('<br><br><br><br>');

      for (let i = 0; i < Math.floor(civ.num/100); i++) {
        entities_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Solar System '+romanize(i+1)+'</span><hr>x1.5<hr>10 Planets</button>');
      }

      uni_contributions_block.append('<br>Solar Systems: <b>x'+numT(galaxy_rate[2])+'</b>');


    }

  }

  
  if(prestige.galaxies==0){galaxies_block.hide();}
  else{

    galaxies_block.show();


    galaxies_list.html('');

    for (let i = 0; i < prestige.galaxies; i++) {
      galaxies_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Galaxy '+romanize(i+1)+'</span><hr>x2</button>');
    }


  }
  

  if(prestige.universes==0){universes_block.hide();}
  else{

    universes_block.show();


    universes_list.html('');

    for (let i = 0; i < prestige.universes; i++) {
      universes_list.append('<button class="button1_tech"><span class="civ'+(i+1)+'">Universe '+romanize(i+1)+'</span><hr>x2</button>');
    }


  }


  all_button1_tech=$(".button1_tech");
  all_button1_tech.click(function(){
    //playAudio(2);
    //civ.counter+= 0.02*(civ.num%10)*current_rate;
  });


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

    //backwards compatibility (dev)
    if(typeof civ.hammer2 === 'undefined'){civ.hammer2=1;}
    if(typeof civ.hammer2_factor === 'undefined'){civ.hammer2_factor=0;}
    if(typeof player.seen.hammer2 === 'undefined'){player.seen.hammer2=0;}

    if(typeof civ.hammer3 === 'undefined'){civ.hammer3=1;}
    if(typeof civ.hammer3_factor === 'undefined'){civ.hammer3_factor=0;}
    if(typeof player.seen.hammer3 === 'undefined'){player.seen.hammer3=0;}

    if(typeof prestige.galaxies === 'undefined'){

      if(prestige.universes!=0){
        prestige.galaxies=prestige.universes;
        prestige.universes=0;
      }else{
        prestige.galaxies=0;
      }
      

    }


    //offline progress
    if(prestige.offline==1){
      if(player.time>0){
        diff = Date.now()-player.time;
        calc(diff/1000);
      }
    }

    rateCalc();

}
function delSave(){
  localStorage.removeItem(savefile_name);
}


function getPrices(base_price,growth_rate,current_amount){

  let all_prices=[0,0,0];

  all_prices[0]=base_price * Math.pow(growth_rate,current_amount) * (Math.pow(growth_rate,1)-1) / (growth_rate-1);
  all_prices[1]=base_price * Math.pow(growth_rate,current_amount) * (Math.pow(growth_rate,10)-1) / (growth_rate-1);
  all_prices[2]=base_price * Math.pow(growth_rate,current_amount) * (Math.pow(growth_rate,100)-1) / (growth_rate-1);

  //let result=base_price*Math.pow(growth_rate,9);
  return all_prices;

}
function getPrices2(base_price,growth_rate,current_amount,desired_amount){

  return base_price * Math.pow(growth_rate,current_amount) * (Math.pow(growth_rate,desired_amount)-1) / (growth_rate-1);

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

function setCivs(num){
  civ.num=num;
  buyRecalc();
}

function setupAudio(){

  session_data.click1 = new Howl({
    src: ['snd/click1.wav']
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
