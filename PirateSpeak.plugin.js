/**
 * @name msg algorithm
 * @author gen0930
 * @version 1.0.0
 * @description pirate / british / uwu message transformer (remote version)
 */

module.exports = class PirateSpeak {

    constructor() {
        this.mode = "pirate";

        this.replacementsMap = {
            pirate: null,
            british: null
        };

        this.observer = null;
    }

    async start() {
        await this.loadAllReplacements();
        this.inject();

        this.observer = new MutationObserver(() => {
            this.inject();
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log("[msg algorithm remote] started");
    }

    stop() {
        this.observer?.disconnect();

        document.getElementById("pirate-btn")?.remove();
        document.getElementById("pirate-menu")?.remove();

        console.log("[msg algorithm remote] stopped");
    }

    async loadAllReplacements() {
        await Promise.all([
            this.loadReplacements(
                "pirate",
                "https://raw.githubusercontent.com/gen0930guy/something/main/updatedlist.json"
            ),
            this.loadReplacements(
                "british",
                "https://raw.githubusercontent.com/gen0930guy/something/main/britishworking.json"
            )
        ]);
    }

    async loadReplacements(mode, url) {
        try {
            const res = await fetch(url);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            this.replacementsMap[mode] = await res.json();

            console.log(`[msg algorithm remote] ${mode} loaded`);
        } catch (err) {
            console.error(`[msg algorithm remote] failed ${mode}`, err);
            this.replacementsMap[mode] = {};
        }
    }

    inject() {
        if (document.getElementById("pirate-btn")) return;

        const textbox = document.querySelector("div[role='textbox']");
        if (!textbox) return;

        const form = textbox.closest("form");
        if (!form) return;

        const buttonRow = form.querySelector("div[class*='buttons']");
        if (!buttonRow) return;

        const button = document.createElement("button");

        button.id = "pirate-btn";
        button.type = "button";

        const img = document.createElement("img");
        img.src = "https://i.imgur.com/f5S4Z3F.png";

        Object.assign(img.style, {
            width: "20px",
            height: "25px",
            pointerEvents: "none"
        });

        button.appendChild(img);

        Object.assign(button.style, {
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            marginLeft: "6px",
            opacity: "0.8",
            padding: "0"
        });

        button.onclick = (e) => {
            e.preventDefault();
            this.runMode();
        };

        button.oncontextmenu = (e) => {
            e.preventDefault();
            this.openMenu(e.clientX, e.clientY);
        };

        buttonRow.appendChild(button);
    }

    runMode() {
        const replacements = this.replacementsMap[this.mode];

        if (!replacements) return;

        this.transform(replacements);
    }

    transform(replacements) {
        const textbox = document.querySelector("div[role='textbox']");
        if (!textbox) return;

        let text = textbox.innerText;

        let transformed = text
            .split(/\b/)
            .map(word => {
                const lower = word.toLowerCase();
                const options = replacements[lower];

                if (!options) return word;

                const totalWeight = options.reduce((a, [, w]) => a + w, 0);

                let rand = Math.random() * totalWeight;

                for (const [rep, weight] of options) {
                    rand -= weight;
                    if (rand <= 0) return rep;
                }

                return options[0][0];
            })
            .join("");

        if (this.mode === "pirate") transformed += " 🏴‍☠️";

        if (this.mode === "british") {
            const endings = [
                ", good sir.",
                ", my liege.",
                ", I daresay.",
                ", if it please thee.",
                "."
            ];

            transformed += endings[Math.floor(Math.random() * endings.length)];
        }

        this.replaceTextboxText(textbox, transformed);
    }

    replaceTextboxText(textbox, newText) {
        textbox.focus();
        document.execCommand("selectAll", false, null);

        const data = new DataTransfer();
        data.setData("text/plain", newText);

        const event = new ClipboardEvent("paste", {
            clipboardData: data,
            bubbles: true
        });

        textbox.dispatchEvent(event);
    }

    openMenu(x, y) {
        document.getElementById("pirate-menu")?.remove();

        const menu = document.createElement("div");

        menu.id = "pirate-menu";

        Object.assign(menu.style, {
            position: "fixed",
            bottom: `${window.innerHeight - y}px`,
            left: `${x}px`,
            width: "220px",
            background: "#2b2d31",
            borderRadius: "8px",
            zIndex: "999999",
            overflow: "hidden",
            border: "1px solid #1e1f22"
        });

        const header = document.createElement("div");

        header.innerText = "mode select";

        Object.assign(header.style, {
            padding: "10px",
            color: "#fff",
            background: "#232428",
            fontWeight: "600"
        });

        menu.appendChild(header);

        const makeOption = (label, mode) => {
            const opt = document.createElement("div");

            opt.innerText = label;

            Object.assign(opt.style, {
                padding: "8px 10px",
                cursor: "pointer",
                color: "#dbdee1"
            });

            opt.onclick = () => {
                this.mode = mode;
                menu.remove();
            };

            return opt;
        };

        const container = document.createElement("div");
        container.appendChild(makeOption("Pirate", "pirate"));
        container.appendChild(makeOption("Uwu", "placeholder"));
        container.appendChild(makeOption("British", "british"));

        menu.appendChild(container);

        document.body.appendChild(menu);
    }
};
