
export default class CoroutineRunner {
    constructor() {
      this.generator_stacks = [];
      this.add_queue = [];
      this.remove_queue = new Set();
      this.delta = 0;
    }
  
    *waitSeconds(duration) {
      while (duration > 0) {
        duration -= this.delta;
        // console.log(`duration: ${duration}`);
        yield;
      }
    }
  
    isBusy() {
      return (this.add_queue.length +
        this.generator_stacks.length > 0);
    }
  
    add(generator, delay = 0) {
      const generators = [generator];
      if (delay)
        generators.push(this.waitSeconds(delay));
  
      this.add_queue.push(generators);
    }
  
    remove() {
      this.remove_queue.add(generator);
    }
  
    update(delta) {
      this.delta = delta;
      this._addQueued();
      this._removeQueued();
  
      // update all stacks in // 
      for (const stack of this.generator_stacks) {
        const main_generator = stack[0];
        // if one coroutine remove one other
        if (this.remove_queue.has(main_generator)) {
          continue;
        }
  
        while (stack.length) {
          const gen = stack[stack.length - 1];
          const { value, done } = gen.next();
  
          if (done) {
            if (stack.length == 1) {
              this.remove_queue.add(gen);
              break;
            }
            stack.pop();
          }
  
          else if (value) {
            stack.push(value);
          }
  
          else {
            break;
          }
        }
      }
  
      this._removeQueued();
    }
  
    _addQueued() {
      if (this.add_queue.length) {
        this.generator_stacks.splice(this.generator_stacks.length, 0, ...this.add_queue);
        this.add_queue = [];
      }
    }
  
    _removeQueued() {
      if (this.remove_queue.size) {
        this.generator_stacks = this.generator_stacks.filter(
          stack => !this.remove_queue.has(stack[0])
        )
        this.remove_queue.clear();
      }
    }
  }