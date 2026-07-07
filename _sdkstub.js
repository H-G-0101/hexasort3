/* ===== STUB local completo dos SDKs (GameDistribution/Azerion/MSN) — ESTUDO ===== */
(function(){
  "use strict";
  var R=function(v){return Promise.resolve(v);};
  window._azerionIntegration = window._azerionIntegration || {gdId:"local-study",advType:"local",gmoEnabled:false,p:undefined,alxType:"none"};
  // API completa exigida pelo plugin Azerion_Integration_SDK
  window._azerionIntegrationSDK = {
    init:function(){},
    onLoadStart:function(){return R();},
    onLoadProgress:function(){},
    onLoadComplete:function(){return R();},
    onGameStart:function(){return R();},
    onGameEnd:function(){return R();},
    onSplashRemoved:function(){return R();},
    onAdProviderLoaded:function(){return R();},
    addListeners:function(){},
    getPlatformAudioStatus:function(){return true;},
    getPlatformLanguage:function(){return "en";},
    hasPlatformAudioControl:function(){return false;},
    hasPlatformLanguage:function(){return false;},
    rewardedAdAvailable:function(){return R(false);},
    preloadAd:function(){return R();},
    showInterstitialAd:function(){return R();},
    showRewardedAd:function(){return R({rewarded:false});},
    sendScoreEvent:function(){},
    ads:{ isAdPlaying:function(){return false;}, pauseAdTimer:function(){}, resumeAdTimer:function(){} },
    data:{
      saveData:function(k,v){ try{localStorage.setItem("gd_"+k, typeof v==="string"?v:JSON.stringify(v));}catch(e){} return R(); },
      loadData:function(k){ try{return R(localStorage.getItem("gd_"+k));}catch(e){return R(null);} }
    }
  };
  window.h5branding = window.h5branding || {Hosts:{isWhitelistedSite:function(){return false;}}};
  // MSN msstart
  window.msstart = window.msstart || {init:function(){return R();},ready:function(){return R();},
    getInterstitialAdAsync:function(){return R({showAsync:function(){return R();}});},
    getRewardedAdAsync:function(){return R({showAsync:function(){return R({rewarded:false});}});},
    startGameAsync:function(){return R();},gameplayStartAsync:function(){return R();},gameplayStopAsync:function(){return R();}};
  window.GD_OPTIONS=window.GD_OPTIONS||{};
  window.gdsdk=window.gdsdk||{showAd:function(){return R();},preloadAd:function(){return R();},openConsole:function(){}};
  console.log("[stub] SDKs locais OK (API Azerion completa)");
})();
