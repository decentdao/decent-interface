const DEFAULT_STREAM: Stream = {
    type: 'tranched',
    tokenAddress: '',
    recipientAddress: '',
    startDate: new Date(),
    tranches: [DEFAULT_TRANCHE],
    totalAmount: {
      value: '0',
      bigintValue: 0n,
    },
    cancelable: true,
    transferable: false,
  };

export function ProposalStreams({
    streams,
    setStreams,
    pendingTransaction,
  }: {
    streams: Stream[];
    setStreams: Dispatch<SetStateAction<Stream[]>>;
    pendingTransaction: boolean;
  }) {
    const handleUpdateStream = (streamIndex: number, values: Partial<Stream>) => {
      setStreams(prevState =>
        prevState.map((item, index) => (streamIndex === index ? { ...item, ...values } : item)),
      );
    };
    return (
      <Box>
        <Accordion
          allowMultiple
          defaultIndex={[0]}
        >
          {streams.map((stream, index) => (
            <AccordionItem
              key={index}
              borderTop="none"
              borderBottom="none"
              my="1.5rem"
            >
              {({ isExpanded }) => (
                <Box borderRadius={4}>
                  <AccordionButton
                    py="0.25rem"
                    px="1.5rem"
                    textStyle="heading-small"
                    color="lilac-0"
                    justifyContent="space-between"
                  >
                    <Flex
                      alignItems="center"
                      gap={2}
                    >
                      {isExpanded ? <CaretDown /> : <CaretRight />}
                      <Text
                        textStyle="heading-small"
                        textTransform="capitalize"
                      >
                        Stream {index + 1} ({stream.type})
                      </Text>
                    </Flex>
                    {index !== 0 ||
                      (streams.length !== 1 && (
                        <IconButton
                          icon={<MinusCircle />}
                          aria-label="Remove stream"
                          variant="unstyled"
                          onClick={() =>
                            setStreams(prevState =>
                              prevState.filter((_, filteredIndex) => filteredIndex !== index),
                            )
                          }
                          minWidth="auto"
                          color="lilac-0"
                          _disabled={{ opacity: 0.4, cursor: 'default' }}
                          sx={{ '&:disabled:hover': { color: 'inherit', opacity: 0.4 } }}
                          isDisabled={pendingTransaction}
                        />
                      ))}
                  </AccordionButton>
                  <StreamBuilder
                    stream={stream}
                    handleUpdateStream={handleUpdateStream}
                    index={index}
                    pendingTransaction={pendingTransaction}
                  />
                  <Box
                    mt="1.5rem"
                    px="1.5rem"
                  >
                    <Alert status="info">
                      <Box
                        width="1.5rem"
                        height="1.5rem"
                      >
                        <WarningCircle size="24" />
                      </Box>
                      <Text
                        whiteSpace="pre-wrap"
                        ml="1rem"
                      >
                        Stream will be started in the moment of proposal execution. In order to
                        {` "emulate"`} delay of stream start - first tranche should have amount set to
                        0 with desired {`"delay"`} duration.
                      </Text>
                    </Alert>
                  </Box>
                </Box>
              )}
            </AccordionItem>
          ))}
        </Accordion>
        <Divider my="1.5rem" />
        <Box p="1.5rem">
          <CeleryButtonWithIcon
            onClick={() => {
              setStreams(prevState => [...prevState, DEFAULT_STREAM]);
              scrollToBottom(100, 'smooth');
            }}
            isDisabled={pendingTransaction}
            icon={Plus}
            text="Add stream"
          />
        </Box>
      </Box>
    );
  }