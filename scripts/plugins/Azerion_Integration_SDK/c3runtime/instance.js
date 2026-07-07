
const C3 = globalThis.C3;

C3.Plugins.Azerion_Integration_SDK.Instance = class SingleGlobalInstance extends globalThis.ISDKInstanceBase
{
	constructor()
	{
		super();
		
		// Initialise object properties		
		const properties = this._getInitProperties();
		const timerDisabledSites = ['coolmathgames.com'];
		let timerDisabledViaUrlOverride = false;

		if (window.hasOwnProperty('h5branding')) {
			timerDisabledViaUrlOverride = h5branding.Hosts.isWhitelistedSite(timerDisabledSites, window.location.search);
		}

		if (timerDisabledViaUrlOverride) {
			this._enableTimer = false;
		} else {
			this._enableTimer = properties ? properties[0] : false;
		}

		this._adSkipped = false;
		this._adCancelled = false;
		this._saveDataCompleted = false;
		this._loadDataCompleted = false;
		this._storedData = null;
		this._shortSplashLoadTime = false;
		this._audioEnabled = true;
		this._startWithAudioEnabled = true;
		this._useDeviceLocale = false;
		this._useDeviceAudioStatus = false;
		this._webPageVisibilityHandlingDisabled = false;

		this._gameId = window['_azerionIntegration']['gdId'] || undefined;
		this._adProvider = window['_azerionIntegration']['advType'] || 'gd';
		this._gmoEnabled = window['_azerionIntegration']['gmoEnabled'] || false;
		this._externalSdk = window['_azerionIntegration']['p'] || undefined;
		this._alxType = window['_azerionIntegration']['alxType'] || 'none';

		this._azIntegrationSDK = globalThis._azerionIntegrationSDK;
		this._azerIntegrationConfig = globalThis._azerionIntegration;

		// limiting to yt as a proof of concept for external sdk integration
		this._shortSplashLoadTime = this._externalSdk && (this._externalSdk === 'yt' || this._externalSdk === 'ytplayable' || window.hasOwnProperty('ytgame'));
		this._webPageVisibilityHandlingDisabled = this._externalSdk && (this._externalSdk === 'yt' || this._externalSdk === 'ytplayable' || window.hasOwnProperty('ytgame'));
		this.YTSdkInitialized = this._externalSdk && (this._externalSdk === 'yt' || this._externalSdk === 'ytplayable' || window.hasOwnProperty('ytgame'));
	}
	
	_release()
	{
		super._release();
	}
	
	_saveToJson()
	{
		return {
			// data to be saved for savegames
		};
	}
	
	_loadFromJson(o)
	{
		// load state for savegames
	}

	_initializeSDK() {
		// Initialize SDK here
		this._azIntegrationSDK.init({
			enableAdTimer: false,
            enableBanner: false,
            splashEnabled: false,
            gmoEnabled: this._gmoEnabled,
            extSdk: this._externalSdk,
            alxType: this._alxType,
            adProvider: this._adProvider,
            gameId: this._gameId
		});
	}

	async _onLoadStart() {
		await this._azIntegrationSDK.onLoadStart();
	}

	_onLoadProgress(progress) {
		this._azIntegrationSDK.onLoadProgress(progress);
	}

	async _onLoadComplete() {
		await this._azIntegrationSDK.onLoadComplete();
	}

	_addListeners() {
		this._azIntegrationSDK.addListeners(() => {
			this.runtime.callFunction('PauseGame');
		}, () => {
			this.runtime.callFunction('ResumeGame');
		},
		() => {
			this._audioEnabled = false;
			this.runtime.callFunction('MuteGame');			
			C3.Plugins.Azerion_Integration_SDK.Cnds.OnAudioStatusChanged();
		},
		() => {
			this._audioEnabled = true;
			this.runtime.callFunction('UnmuteGame');			
			C3.Plugins.Azerion_Integration_SDK.Cnds.OnAudioStatusChanged();
		});
	}

	async _onAdProviderLoaded(){
		await this._azIntegrationSDK.onAdProviderLoaded();
	}

	async _onGameStart() {
		await this._azIntegrationSDK.onGameStart();
	}

	async _onGameEnd() {
		await this._azIntegrationSDK.onGameEnd();
	}

	async _showInterstitialAd() {
		await this._azIntegrationSDK.showInterstitialAd();
	}

	async _showRewardedAd() {
		const result = await this._azIntegrationSDK.showRewardedAd();
		const { rewarded, adCancelled, adSkipped } = result;
		this._adCancelled = adCancelled;
		this._adSkipped = adSkipped;

		if (rewarded) {
			this.runtime.callFunction('GrantRewardOnAdWatched');
		} else {
			this.runtime.callFunction('OnGrantRewardFailed');
		}
	}

	_preloadAd(type) {
		this._azIntegrationSDK.preloadAd(type);
	}

	async _sendScoreEvent(score, level, cummulativeScore, gameTitle, platformId) {
		const scoreConfig = {
			score: score,
			platformId: platformId,
			cummulativeScore: cummulativeScore,
			level: level,
			scoreFormat: 'numeric',
			gameTitle: gameTitle
		};
		await this._azIntegrationSDK.sendScoreEvent(scoreConfig);
	}

	_pauseAdTimer() {
		if (!this._enableTimer) {
			console.log('Ad timer is not enabled');
			return;
		}
		this._azIntegrationSDK.ads.pauseAdTimer();
	}

	_resumeAdTimer() {
		if (!this._enableTimer) {
			console.log('Ad timer is not enabled');
			return;
		}
		this._azIntegrationSDK.ads.resumeAdTimer();
	}

	_isAdPlaying() {
		return this._azIntegrationSDK.ads.isAdPlaying();
	}

	_isRewardedAvailable() {
		return this._azIntegrationSDK.rewardedAdAvailable();
	}

	_isAdCancelled() {
		return this._adCancelled;
	}

	_isAdSkipped() {
		return this._adSkipped;
	}

	_loadData() {
		this._azIntegrationSDK.data.loadData().then((data) => {
			this._loadDataCompleted = true;
			this._storedData = data;
			C3.Plugins.Azerion_Integration_SDK.Cnds.OnLoadData();
		});
	}

	_saveData(data) {
		this._azIntegrationSDK.data.saveData(data).then(() => {
			this._saveDataCompleted = true;
			C3.Plugins.Azerion_Integration_SDK.Cnds.OnSaveData();
		});
	}

	_getPlatformLanguage() {
		return this._azIntegrationSDK.getPlatformLanguage();
	}

	_getPlatformAudioStatus() {
		return this._azIntegrationSDK.getPlatformAudioStatus();
	}

	_getPlatformAudioStatusOnLoad() {
		return this._azIntegrationSDK.getPlatformAudioStatus();
	}

	_isAudioPlatformControlled() {
		if (this.YTSdkInitialized) {
			return this._azIntegrationSDK.hasPlatformAudioControl();
		}
	}

	_isLanguagePlatformControlled() {
		if (this.YTSdkInitialized) {
			return this._azIntegrationSDK.hasPlatformLanguage();
		}
	}

	_isAudioEnabledOnStart() {
		if (this.YTSdkInitialized) {
			return this._azIntegrationSDK.getPlatformAudioStatus();
		}
	}

	_isWebVisibilityDisabled() {
		return this._webPageVisibilityHandlingDisabled;
	}

	_isYTPlatform() {
		return this.YTSdkInitialized;
	}

	_onSplashRemoved() {
		this._azIntegrationSDK.onSplashRemoved();
	}
}
