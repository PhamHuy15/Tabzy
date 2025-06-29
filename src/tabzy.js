function Tabzy(selector, options = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
        console.error('Container not found');
        return;
    }

    this.tabs = Array.from(this.container.querySelectorAll('li a'));
    if (!this.tabs.length) {
        console.error('No tabs found');
        return;
    }

    this.panels = this.getPanel();

    if (this.tabs.length !== this.panels.length) return;

    this.opt = Object.assign(
        {
            activeClassName: 'tabzy--active',
            remember: true,
            onchange: true,
        },
        options,
    );

    this._cleanRegex = /[^a-zA-Z0-9]/g;
    this.paramKey = selector.replace(this._cleanRegex, '');
    this._originalHTML = this.container.innerHTML;

    this._init();
}

Tabzy.prototype.getPanel = function () {
    return this.tabs
        .map((tab) => {
            const panel = document.querySelector(tab.getAttribute('href'));
            if (!panel) {
                console.error(`Panel for tab "${tab.getAttribute('href')}" not found`);
            }
            return panel;
        })
        .filter(Boolean);
};

Tabzy.prototype._init = function () {
    const searchParam = new URLSearchParams(location.search);
    const tabSelector = searchParam.get(this.paramKey);

    const tab =
        (this.opt.remember &&
            tabSelector &&
            this.tabs.find((tab) => tab.getAttribute('href').replace(this._cleanRegex, '') === tabSelector)) ||
        this.tabs[0];

    this.currentTab = tab;

    this._activateTab(tab, false, false);

    this.tabs.forEach((tab) => {
        tab.onclick = (event) => {
            event.preventDefault();

            this._tryActiveTab(tab);
        };
    });
};

Tabzy.prototype._activateTab = function (tab, triggerOnChange = true, updateURL = this.opt.remember) {
    this.tabs.forEach((tab) => {
        tab.closest('li').classList.remove(this.opt.activeClassName);
    });

    tab.closest('li').classList.add(this.opt.activeClassName);

    this.panels.forEach((panel) => (panel.hidden = true));

    const panelActive = document.querySelector(tab.getAttribute('href'));
    panelActive.hidden = false;

    const searchPrams = new URLSearchParams(location.search);
    const paramValue = tab.getAttribute('href').replace(this._cleanRegex, '');

    searchPrams.set(this.paramKey, paramValue);

    if (updateURL) {
        history.replaceState(null, null, `?${searchPrams}`);
    }

    if (triggerOnChange && typeof this.opt.onchange === 'function') {
        this.opt.onchange({
            tab,
            panel: panelActive,
        });
    }
};

Tabzy.prototype._tryActiveTab = function (tab) {
    if (this.currentTab !== tab) {
        this.currentTab = tab;
        this._activateTab(tab);
    }
};

Tabzy.prototype.switch = function (input) {
    let tabToActivate =
        typeof input === 'string'
            ? this.tabs.find((tab) => tab.getAttribute('href') === input)
            : this.tabs.includes(input)
            ? input
            : null;

    if (!tabToActivate) {
        console.error(`No panel found with ID: ${input}`);
        return;
    }

    this._tryActiveTab(tab);
};

Tabzy.prototype.destroy = function () {
    this.container.innerHTML = this._originalHTML;
    this.panels.forEach((panel) => (panel.hidden = false));

    this.container = null;
    this.panels = null;
    this.tabs = null;
    this._tryActiveTab = null;
};
