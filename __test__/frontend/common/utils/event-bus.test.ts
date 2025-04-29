// eventBus.test.ts
import { EventBus, EVENTS } from '@frontend/common/utils/event-bus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    // Create a fresh EventBus instance before each test
    eventBus = new EventBus();
  });


  test('should subscribe to an event and receive published data', () => {
    // Arrange
    const callback = jest.fn();
    const testData = { message: 'Hello World' };
    
    // Act
    eventBus.subscribe('TEST_EVENT', callback);
    eventBus.publish('TEST_EVENT', testData);
    
    // Assert
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(testData);
  });

  test('should allow multiple subscribers to the same event', () => {
    // Arrange
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const testData = { message: 'Hello World' };
    
    // Act
    eventBus.subscribe('TEST_EVENT', callback1);
    eventBus.subscribe('TEST_EVENT', callback2);
    eventBus.publish('TEST_EVENT', testData);
    
    // Assert
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(testData);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith(testData);
  });

  test('should not call subscribers of different events', () => {
    // Arrange
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    // Act
    eventBus.subscribe('EVENT_1', callback1);
    eventBus.subscribe('EVENT_2', callback2);
    eventBus.publish('EVENT_1', {});
    
    // Assert
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();
  });

  test('should allow unsubscribing from events', () => {
    // Arrange
    const callback = jest.fn();
    
    // Act
    const unsubscribe = eventBus.subscribe('TEST_EVENT', callback);
    unsubscribe();
    eventBus.publish('TEST_EVENT', {});
    
    // Assert
    expect(callback).not.toHaveBeenCalled();
  });

  test('should handle multiple arguments in publish', () => {
    // Arrange
    const callback = jest.fn();
    const arg1 = 'first argument';
    const arg2 = { second: 'argument' };
    const arg3 = [1, 2, 3];
    
    // Act
    eventBus.subscribe('MULTI_ARG_EVENT', callback);
    eventBus.publish('MULTI_ARG_EVENT', arg1, arg2, arg3);
    
    // Assert
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(arg1, arg2, arg3);
  });

  test('should do nothing when publishing to an event with no subscribers', () => {
    // This test ensures that publishing to an event with no subscribers doesn't throw an error
    expect(() => {
      eventBus.publish('NO_SUBSCRIBERS', {});
    }).not.toThrow();
  });

  test('should do nothing when unsubscribing multiple times', () => {
    // Arrange
    const callback = jest.fn();
    
    // Act
    const unsubscribe = eventBus.subscribe('TEST_EVENT', callback);
    unsubscribe();
    
    // Should not throw an error when calling unsubscribe multiple times
    expect(() => {
      unsubscribe();
      unsubscribe();
    }).not.toThrow();
    
    eventBus.publish('TEST_EVENT', {});
    expect(callback).not.toHaveBeenCalled();
  });

  test('should handle concurrent subscriptions and unsubscriptions correctly', () => {
    // Arrange
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    
    // Act
    eventBus.subscribe('TEST_EVENT', callback1);
    const unsubscribe2 = eventBus.subscribe('TEST_EVENT', callback2);
    eventBus.subscribe('TEST_EVENT', callback3);
    
    unsubscribe2(); // Unsubscribe the middle one
    
    eventBus.publish('TEST_EVENT', {});
    
    // Assert
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).toHaveBeenCalledTimes(1);
  });
});

// Test for the EVENTS constant
describe('EVENTS', () => {
  test('should have the expected event constants', () => {
    expect(EVENTS).toHaveProperty('SERVICE_UPDATED');
  });
});