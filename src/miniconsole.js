export default class MiniConsole {
    constructor() {
        this.minsize = '1rem';
        this.maxsize = '8rem';
        this.output = document.createElement('pre');
        this.output.style.color = '#888';
        this.output.style.background = '#555';
        this.output.style.margin = '0';
        this.output.style.position = 'absolute';
        this.output.style.zIndex = '100';
        this.output.style.overflow = 'auto';
        this.output.style.width = '100%';
        this.output.style.flexDirection = 'column-reverse';
        this.output.onclick = () => this.toggleSize();
        this.maximize();
        this.hide();
        
        document.body.insertBefore(this.output, document.body.firstChild);
        
        // Reference to native method(s)
        this.log = console.log;
        console.log = (...e) => this.consoleCatcher('', ...e)
        console.warn = (...e) => this.consoleCatcher('warn:', ...e)
        console.error = (...e) => this.consoleCatcher('err:', ...e)
        window.onerror = (m, s, ln, col, err) => this.errorCatcher(m, s, ln, col, err);
    }

    consoleCatcher(level, ...items) {
        this.show()
        // Call native method first
        this.log.apply(this, items);

        // Use JSON to transform objects, all others display normally
        items.forEach((item, i) => {
            items[i] = (item != null && typeof item === 'object' ? JSON.stringify(item, null, 2) : item);
        });

        this.output.innerHTML += `${level}${items.join(' ')} <br />`;
        this.keep(10);
    }

    errorCatcher(msg, src, line, col, error) {
        this.show()
        const stack = { msg, src, line, col, error }
        this.output.innerHTML += 'error: <br />' + JSON.stringify(stack, null, 2)
        this.keep(10)
    }

    keep(length = 10) {
        while (this.output.childElementCount > length)
            this.output.removeChild(this.output.firstChild)
    }
    toggleSize() {
        if (this.output.style.maxHeight == this.minsize)
            this.maximize()
        else
            this.minimize()
    }

    toggleVisibility() {
        if (this.output.style.display = 'none')
            this.show()
        else
            this.hide()
    }

    maximize() { this.output.style.maxHeight = this.maxsize }
    minimize() { this.output.style.maxHeight = this.minsize }
    show() { this.output.style.display = 'flex' }
    hide() { this.output.style.display = 'none' }
}