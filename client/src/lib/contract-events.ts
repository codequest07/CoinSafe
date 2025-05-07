import { prepareEvent } from 'thirdweb'

export const myEvent = prepareEvent({
    signature: "event MyEvent(uint256 myArg)",
});
