$(document).ready(function(){

    document.title = "Demigod: Infinity v"+version;
      console.log("microcivilizations v"+version);
      console.log("created by Louigi Verona");
      console.log("https://louigiverona.com/?page=about");
  
  
    //init functions
  
    if(localStorage.getItem(savefile_name)){
        button_play.text('Resume');
        loadGame();
    }else{
        button_play.text('Play');
        setupCiv();
        init();
      
    }
  
    commonInit();
    refreshUI();
  
    
  
    ////////////////
  
    $("html").keydown(function( event ) {
    switch (event.key){
        case "q":

        break;
        case "w":
        //for testing






        break;
        case "s":
        saveGame();
        break;
        case "d":
        delSave();
    }

    });

    button_settings.click(function(){
    playAudio(1);

    if(misc_settings.settings_toggle==0){
        misc_settings.settings_toggle=1;
    }else{misc_settings.settings_toggle=0;}

    refreshUI();
    });
    button_scientific.click(function(){
    playAudio(1);

    if(settings.scientific==0){
        settings.scientific=1;
    }else{settings.scientific=0;}

    refreshUI();
    });
    button_save.click(function(){
    playAudio(2);

    button_save.text("Saved").prop("disabled",true);

    saveGame();

    setTimeout(function() { button_save.text("Save Game").prop("disabled",false); }, 1000);

    });
    button_delsave.click(function(){

    playAudio(1);
    if(misc_settings.save_del_confirm_toggle==0){misc_settings.save_del_confirm_toggle=1;}
    else{misc_settings.save_del_confirm_toggle=0;}
    refreshUI();

    });
    save_del_confirm.click(function(){

    delSave();
    location.reload();

    });
    save_del_cancel.click(function(){

    playAudio(1);
    misc_settings.save_del_confirm_toggle=0;
    refreshUI();

    });
    button_copysave.click(function(){
    playAudio(1);

    let gameData=localStorage.getItem(savefile_name);
    navigator.clipboard.writeText(gameData);

    button_copysave.text("Copied").prop("disabled",true);

    setTimeout(function() { button_copysave.text("Copy").prop("disabled",false); }, 1000);

    });
    button_importsave.click(function(){

    if(import_save_dump.text().length<=0){return;}


    playAudio(1);

    localStorage.setItem(savefile_name, import_save_dump.text());
    import_save_dump.text('');

    misc_settings.settings_toggle=0;

    loadGame();
    refreshUI();

    });
    button_audio.click(function(){

    playAudio(1);

    if(settings.audio_mute==0){
        settings.audio_mute=1;
    }else{
        settings.audio_mute=0;
        playAudio(1);
    }

    refreshUI();

    });
    audio_control_volume.mousemove(function(){
        settings.audio_volume=audio_control_volume.val();
        Howler.volume(settings.audio_volume);
    });

    button_play.click(function(){

        playAudio(2);

        if(session_data.main_loop==null){
            session_data.main_loop=setInterval(loop, 50);
        }

        refreshUI();

    });

    hammer.click(function(){

        playAudio(2);
        civ.hammer=0;

        if(player.seen.hammer==0){player.seen.hammer=1;}

        if(galaxies_num>0){civ.counter*=2+galaxies_num;}
        else{civ.counter*=2;}

        refreshUI();

    });
  
  
  });//document.ready