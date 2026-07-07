
const C3 = globalThis.C3;

C3.Plugins.Azerion_Integration_SDK.Cnds =
{
	IsAdPlaying()
	{
		return this._isAdPlaying();
	},

	IsRewardedAvailable() {
		return this._isRewardedAvailable();
	},

	IsAdCancelled() {
		return this._isAdCancelled();
	},
	
	IsAdSkipped() {
		return this._isAdSkipped();
	},

	OnSaveData()
	{
		return this._saveDataCompleted;
	},

	OnLoadData()
	{
		return this._loadDataCompleted;
	},

	hasShorterSplashLoadTime()
	{
		return this._shortSplashLoadTime;
	},

	OnAudioStatusChanged()
	{
		return true;
	},

	usesDeviceLocale()
	{
		return this._isLanguagePlatformControlled();
	},

	usesDeviceAudioStatus()
	{
		return this._isAudioPlatformControlled();
	},

	disablesWebPageVisibilityHandling()
	{
		return this._isWebVisibilityDisabled();
	},

	IsAudioEnabledOnStart()
	{
		return this._isAudioEnabledOnStart();
	},

	isAudioEnabled()
	{
		return this._getPlatformAudioStatus();
	},

	isAudioEnabledOnPlatform() {
		return this._getPlatformAudioStatus();
	},

	IsWebVisibilityDisabled(){
		return this._isWebVisibilityDisabled();
	},

	IsYTPlatform(){
		return this._isYTPlatform();
	}
};
