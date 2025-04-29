type EventCallback = (...args: unknown[]) => void

export class EventBus {
  private events: Record<string, EventCallback[]> = {}

  subscribe(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter((cb) => cb !== callback)
    }
  }

  publish(event: string, ...args: unknown[]) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(...args))
    }
  }
}

// Create a singleton instance
export const eventBus = new EventBus()

// Event constants
export const EVENTS = {
  SERVICE_UPDATED: "SERVICE_UPDATED",
}
