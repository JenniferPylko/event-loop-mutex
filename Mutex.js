const cache = Symbol("Mutex Cache")
const locks = Symbol("Mutex Locks")

const defer = typeof setImmediate !== "undefined" ? setImmediate : setTimeout

class Mutex {

    static [cache] = {};

    [locks] = {}

    constructor(handle) {
        if (typeof Mutex[cache][handle] === "undefined") {
            Mutex[cache][handle] = this
        } else {
            return Mutex[cache][handle]
        }
    }

    static defer() {
        return new Promise(defer)
    }

    [Symbol.asyncIterator]() {
        return {
            next: async () => {
                await Mutex.defer()
                return {
                    value: await this.lock(),
                    done:  false
                }
            }
        }
    }

    lock() {
        return new Promise(async (resolve) => {
            while (Object.getOwnPropertySymbols(this[locks]).length > 0) {
                const key = Object.getOwnPropertySymbols(this[locks]).pop()
                await this[locks][key]
                await Mutex.defer()
            }
            const key = Symbol("Mutex Lock")
            this[locks][key] = new Promise((unlock) =>
                void resolve(() => {
                    unlock()
                    delete this[locks][key]
                }))
        })
    }
}

module.exports = Mutex