
const C3 = globalThis.C3;

C3.Plugins.Azerion_Integration_SDK.Exps =
{
    GetData() {
        return JSON.stringify(this._storedData);
    },

    GetPlatformLanguage() {
        return this._getPlatformLanguage();
    },

    GetPlatformAudioStatus() {
        return this._isAudioEnabled ? 1 : 0;
    }
};
