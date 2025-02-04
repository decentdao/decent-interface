export const StreamsQueryDocument = `query StreamsQuery($recipientAddress: Bytes) {
  streams(where: { recipient: $recipientAddress }) {
    id
    startTime
    endTime
    canceled
    duration
    category
    cliff
    cliffTime
    cliffAmount
    depositAmount
    withdrawnAmount
    intactAmount
    chainId
    recipient
    parties
    contract {
      address
      id
    }
    timestamp
    segments {
      id
      startTime
      endTime
      amount
      endAmount
      position
    }
    tranches {
      id
      position
      startTime
      startAmount
      amount
      endTime
      endAmount
    }
    asset {
      name
      symbol
      address
      id
      chainId
      decimals
    }
  }
}`;
