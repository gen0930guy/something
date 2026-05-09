/**
 * @name msg algorithm
 * @author gen0930
 * @version 1.0.5
 * @description jsadn
 */

module.exports = class PirateSpeak {

    constructor() {

        this.mode = "pirate";

        this.replacementsMap = {
            pirate: null,
            british: null
        };

        this.observer = null;
        this._interval = null;
    }

    async start() {

        console.log("[remote plugin] start() called");

        await this.loadAllReplacements();

        // safely wait for discord ui
        this._interval = setInterval(() => {
            this.inject();
        }, 1500);

        this.observer = new MutationObserver(() => {
            this.inject();
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log("[remote plugin] started");
    }

    stop() {

        console.log("[remote plugin] stop() called");

        this.observer?.disconnect();

        clearInterval(this._interval);

        document.getElementById("pirate-btn")?.remove();
        document.getElementById("pirate-menu")?.remove();
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

            this.replacementsMap[mode] = await res.json();

            console.log(`[remote plugin] loaded ${mode}`);

        } catch (err) {

            console.error(`[remote plugin] failed ${mode}`, err);

            this.replacementsMap[mode] = {};
        }
    }

    inject() {

        if (document.getElementById("pirate-btn")) {
            return;
        }

        const textbox = document.querySelector("div[role='textbox']");

        if (!textbox) {
            return;
        }

        const form = textbox.closest("form");

        if (!form) {
            return;
        }

        const buttonRow = form.querySelector("div[class*='buttons']");

        if (!buttonRow) {
            return;
        }

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

        // uwu mode handled separately
        if (this.mode === "uwu") {

            this.transformUwu();

            return;
        }

        const replacements = this.replacementsMap[this.mode];

        if (!replacements) {
            return;
        }

        this.transform(replacements);
    }

    transform(replacements) {

        const textbox = document.querySelector("div[role='textbox']");

        if (!textbox) {
            return;
        }

        let text = textbox.innerText;

        let transformed = text
            .split(/\b/)
            .map(word => {

                const lower = word.toLowerCase();

                const options = replacements[lower];

                if (!options) {
                    return word;
                }

                const totalWeight = options.reduce(
                    (a, [, w]) => a + w,
                    0
                );

                let rand = Math.random() * totalWeight;

                for (const [rep, weight] of options) {

                    rand -= weight;

                    if (rand <= 0) {
                        return rep;
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

    transformUwu() {

        const textbox = document.querySelector("div[role='textbox']");

        if (!textbox) {
            return;
        }

        let text = textbox.innerText;

        let transformed = text


            .replace(/na/g, "nya") 
            .replace(/ne/g, "nye") 
            .replace(/ni/g, "nyi") 
            .replace(/no/g, "nyo") 
            .replace(/nu/g, "nyu");

            .replace(/na/gi, match =>
                match[0] === "N" ? "Nya" : "nya"
            )

            .replace(/ne/gi, match =>
                match[0] === "N" ? "Nye" : "nye"
            )

            .replace(/ni/gi, match =>
                match[0] === "N" ? "Nyi" : "nyi"
            )

            .replace(/no/gi, match =>
                match[0] === "N" ? "Nyo" : "nyo"
            )

            .replace(/nu/gi, match =>
                match[0] === "N" ? "Nyu" : "nyu"
            )

            // special words
            .replace(/\bhi+\b/gi, () => {

                return Math.random() < 0.5
                    ? "hai"
                    : "haiiii";
            })

            // cute speech
            .replace(/ove/gi, "uv")

            .replace(/th/gi, match => {

                if (match === "TH") {
                    return "D";
                }

                if (match[0] === "T") {
                    return "D";
                }

                return "d";
            })

            // random stuttering
            .split(" ")

            .map(word => {

                if (
                    word.length > 2 &&
                    Math.random() < 0.20 &&
                    /^[a-z]/i.test(word)
                ) {

                    return `${word[0]}-${word}`;
                }

                return word;
            })

            .join(" ");

        // random furry endings
        const endings = [
            " UwU",
            " OwO",
            " >w<",
            " ~w~",
            " :3",
            " nya~",
            " rawr x3",
            " ^w^"
        ];

        transformed += endings[
            Math.floor(Math.random() * endings.length)
        ];

        this.replaceTextboxText(textbox, transformed);
    }

    replaceTextboxText(textbox, newText) {

        textbox.focus();

        document.execCommand(
            "selectAll",
            false,
            null
        );

        const data = new DataTransfer();

        data.setData(
            "text/plain",
            newText
        );

        const event = new ClipboardEvent(
            "paste",
            {
                clipboardData: data,
                bubbles: true
            }
        );

        textbox.dispatchEvent(event);
    }

    openMenu(x, y) {

        document.getElementById(
            "pirate-menu"
        )?.remove();

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

            opt.onmouseenter = () => {
                opt.style.background = "#35373c";
            };

            opt.onmouseleave = () => {
                opt.style.background = "transparent";
            };

            opt.onclick = () => {

                this.mode = mode;

                menu.remove();

                console.log(
                    `[remote plugin] mode set to ${mode}`
                );
            };

            return opt;
        };

        const container = document.createElement("div");

        container.appendChild(
            makeOption("Pirate", "pirate")
        );

        container.appendChild(
            makeOption("Uwu", "uwu")
        );

        container.appendChild(
            makeOption("British", "british")
        );

        menu.appendChild(container);

        document.body.appendChild(menu);

        // close on outside click
        setTimeout(() => {

            const close = (e) => {

                if (!menu.contains(e.target)) {

                    menu.remove();

                    document.removeEventListener(
                        "mousedown",
                        close
                    );
                }
            };

            document.addEventListener(
                "mousedown",
                close
            );

        }, 0);
    }
};
