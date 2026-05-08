/**
 * @name msg algorithm
 * @author gen0930
 * @version 1.0.2
 * @description Message TRANSFORMER NOW!!!! RAHHH
 * @source https://github.com/gen0930guy/something
 * @updateUrl https://raw.githubusercontent.com/gen0930guy/something/main/PirateSpeak.plugin.js
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

        console.log("[msg algorithm] started");
    }

    stop() {
        this.observer?.disconnect();

        document.getElementById("pirate-btn")?.remove();
        document.getElementById("pirate-menu")?.remove();

        console.log("[msg algorithm] stopped");
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

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const json = await res.json();

            this.replacementsMap[mode] = json;

            console.log(`[msg algorithm] ${mode} replacements loaded`);
        } catch (err) {
            console.error(`[msg algorithm] Failed to load ${mode}:`, err);

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

        button.onmouseenter = () => {
            button.style.opacity = "1";
        };

        button.onmouseleave = () => {
            button.style.opacity = "0.8";
        };

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
        if (this.mode === "placeholder") {
            this.placeholderify();

            return;
        }

        const replacements = this.replacementsMap[this.mode];

        if (!replacements) {
            console.warn(`[msg algorithm] ${this.mode} replacements not loaded yet`);

            return;
        }

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

                const totalWeight = options.reduce(
                    (sum, [, weight]) => sum + weight,
                    0
                );

                let rand = Math.random() * totalWeight;

                for (const [replacement, weight] of options) {
                    rand -= weight;

                    if (rand <= 0) {
                        return replacement;
                    }
                }

                return options[0][0];
            })
            .join("");

        if (this.mode === "pirate") {
            transformed += " 🏴‍☠️";
        }

        if (this.mode === "british") {
            const endings = [
                ", good sir.",
                ", my liege.",
                ", I daresay.",
                ", if it please thee.",
                "."
            ];

            transformed += endings[
                Math.floor(Math.random() * endings.length)
            ];
        }

        this.replaceTextboxText(textbox, transformed);
    }

    placeholderify() {
        const textbox = document.querySelector("div[role='textbox']");

        if (!textbox) return;

        let text = textbox.innerText;

        let transformed = text
            .replace(/[rl]/g, "w")
            .replace(/[RL]/g, "W")
            .replace(/na/g, "nya")
            .replace(/ne/g, "nye")
            .replace(/ni/g, "nyi")
            .replace(/no/g, "nyo")
            .replace(/nu/g, "nyu");

        transformed = transformed
            .split(/\b/)
            .map(word => {
                if (
                    /^[a-zA-Z]/.test(word) &&
                    Math.random() < 0.25
                ) {
                    return word[0] + "-" + word;
                }

                return word;
            })
            .join("");

        const faces = [
            " uwu",
            " owo",
            " >w<",
            " ^w^",
            ", nya~"
        ];

        if (Math.random() < 0.8) {
            transformed += faces[
                Math.floor(Math.random() * faces.length)
            ];
        }

        this.replaceTextboxText(textbox, transformed);
    }

    replaceTextboxText(textbox, newText) {
        textbox.focus();

        document.execCommand("selectAll", false, null);

        const data = new DataTransfer();

        data.setData("text/plain", newText);

        const pasteEvent = new ClipboardEvent("paste", {
            clipboardData: data,
            bubbles: true
        });

        textbox.dispatchEvent(pasteEvent);
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
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            zIndex: "999999",
            fontFamily: "sans-serif",
            overflow: "hidden",
            border: "1px solid #1e1f22"
        });

        const header = document.createElement("div");

        Object.assign(header.style, {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            background: "#232428",
            fontSize: "14px",
            fontWeight: "600",
            color: "#fff"
        });

        header.innerText = "mode select";

        const closeBtn = document.createElement("div");

        closeBtn.innerText = "✕";

        Object.assign(closeBtn.style, {
            cursor: "pointer",
            color: "#b5bac1",
            fontSize: "14px"
        });

        closeBtn.onmouseenter = () => {
            closeBtn.style.color = "#fff";
        };

        closeBtn.onmouseleave = () => {
            closeBtn.style.color = "#b5bac1";
        };

        closeBtn.onclick = () => {
            menu.remove();
        };

        header.appendChild(closeBtn);

        menu.appendChild(header);

        const optionsContainer = document.createElement("div");

        optionsContainer.style.padding = "6px";

        const makeOption = (label, mode) => {
            const option = document.createElement("div");

            option.innerText = label;

            Object.assign(option.style, {
                padding: "8px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                color: "#dbdee1",
                fontSize: "14px",
                marginBottom: "2px",
                background:
                    this.mode === mode
                        ? "#404249"
                        : "transparent"
            });

            option.onmouseenter = () => {
                if (this.mode !== mode) {
                    option.style.background = "#35373c";
                }
            };

            option.onmouseleave = () => {
                option.style.background =
                    this.mode === mode
                        ? "#404249"
                        : "transparent";
            };

            option.onclick = () => {
                this.mode = mode;

                menu.remove();
            };

            return option;
        };

        optionsContainer.appendChild(
            makeOption("🍺 Pirate-ifier", "pirate")
        );

        optionsContainer.appendChild(
            makeOption("🐾 Uwu-ifier", "placeholder")
        );

        optionsContainer.appendChild(
            makeOption("☕ British-ifier", "british")
        );

        menu.appendChild(optionsContainer);

        document.body.appendChild(menu);

        setTimeout(() => {
            document.addEventListener(
                "click",
                (e) => {
                    if (!menu.contains(e.target)) {
                        menu.remove();
                    }
                },
                { once: true }
            );
        }, 0);
    }
};
