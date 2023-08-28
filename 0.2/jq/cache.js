//CACHE

var settings_block;
var button_settings;
var button_save;
var button_delsave;
var button_scientific;
var button_copysave;
var button_importsave;
var import_save_dump;
var button_audio;
var audio_control_volume;

var main_counter_label;
var main_rate_label;
var all_button1_tech;
var main_target_label;
var entities_list;
var entities_block;
var universe_title;
var universes_block;
var universes_list;

var save_del_cancel;
var save_del_confirm;
var save_del_confirm_block;

var uni_contributions_block;
var hammer;
var hammer2;
var hammer3;

var galaxies_block;
var galaxies_list;


$(document).ready(function(){

  //CACHE


  galaxies_block=$("#galaxies_block");
  galaxies_list=$("#galaxies_list");

  hammer3=$("#hammer3");
  hammer2=$("#hammer2");
  hammer=$("#hammer");
  uni_contributions_block=$("#uni_contributions_block");

  save_del_confirm_block=$("#save_del_confirm_block");
  save_del_confirm=$("#save_del_confirm");
  save_del_cancel=$("#save_del_cancel");

  universes_block=$("#universes_block");
  universes_list=$("#universes_list");
  universe_title=$("#universe_title");
  entities_block=$("#entities_block");
  entities_list=$("#entities_list");

  main_target_label=$("#main_target_label");
  main_rate_label=$("#main_rate_label");
  main_counter_label=$("#main_counter_label");

  import_save_dump=$("#import_save_dump");
  button_importsave=$("#button_importsave");
  button_copysave=$("#button_copysave");
  button_scientific=$("#button_scientific");
  settings_block=$("#settings_block");
  button_settings=$("#button_settings");
  button_save=$("#button_save");
  button_delsave=$("#button_delsave");
  button_audio=$("#button_audio");
  audio_control_volume=$("#audio_control_volume");

});