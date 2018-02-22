import AccessStore from './AccessStore';
import UiStore from './UiStore';
import LangStore from './LangStore';
import RouteStore from './RouteStore';

export default class CombinedStores {

    constructor() {

        this.langStore = new LangStore();
        this.uiStore = new UiStore();
        this.accessStore = new AccessStore(this.langStore.active, this.uiStore);

        this.routeStore = new RouteStore(this.accessStore, this.uiStore);

        this.accessStore.addOnSignOutHandler(this.uiStore.onSignedOut);
    }
}