## Bafang UART protocol description

> ⚠️ Warning: you do not need to read this document to use this program. You need it only if you are developer.

> ⚠️ Warning: there is no description what is UART in this document. You need to have a basic electronics knowledge to understand this document.

#### Introduction

UART port on bafang devices works on 1200 baudrate with usual setting. All messages consists of byte codes (without text meaning in ASCII or other encodings). There are four kinds of message frames in bafang protocol: Read Request, Read Response, Write Request and Write Response.

#### Read Request

There is no special frame format for read request. Just send code from special document for your device ("Bafang UART motor protocol" or "Bafang UART display protocol"), for example `0x14 0x16`, and receive response according to next section.

#### Read Response

| Code | Length | Data               | Checksum |
|------|--------|--------------------|----------|
| 0xXX | 0xXX   | 0xXX 0xXX ... 0xXX | 0xXX     |

`Code` is a special byte, that determines, on which request this frame responds.\
`Length` is a number of data bytes.\
`Data` is a several bytes, whose meaning can be different depends on message type (message type determined by Code, every code has a description in special document for your device ("Bafang UART motor protocol" or "Bafang UART display protocol")).\
`Checksum` can be calculated in such way: summ all other bytes (`Code`, `Length` and `Data`) and then take modulus of 256 from this number.\
Example:

| Code | Length | Data                                                        | Checksum |
|------|--------|-------------------------------------------------------------|----------|
| 0x14 | 0x0C   | 0x32 0x30 0x31 0x36 0x30 0x38 0x30 0x38 0x30 0x30 0x30 0x31 | 0x7A     |

`0x14` - code of motor, that retrieves serial number of motor\
`0x0C` - 12 bytes in data section\
`0x32 0x30 0x31 0x36 0x30 0x38 0x30 0x38 0x30 0x30 0x30 0x31` - `201608080001` by ASCII table - serial number of motor\
`0x7A` - `(0x14 + 0x0C + 0x32 + 0x30 + 0x31 + 0x36 + 0x30 + 0x38 + 0x30 + 0x38 + 0x30 + 0x30 + 0x30 + 0x31) % 256`

#### Write Request
Write request have same structure as read response, but code consists not from one byte, but from two.

| Code      | Length | Data               | Checksum |
|-----------|--------|--------------------|----------|
| 0xXX 0xXX | 0xXX   | 0xXX 0xXX ... 0xXX | 0xXX     |

`Code` is a two special bytes, that determine kind of request.\
`Length` is a number of data bytes.\
`Data` is a several bytes, whose meaning can be different depends on message type (message type determined by Code, every code has a description in special document for your device ("Bafang UART motor protocol" or "Bafang UART display protocol")).\
`Checksum` can be calculated in such way: summ second byte of `Code`, all bytes of `Length` and `Data`, and then take modulus of 256 from this number.\
Example:

| Code      | Length | Data                                                        | Checksum |
|-----------|--------|-------------------------------------------------------------|----------|
| 0x17 0x01 | 0x0C   | 0x32 0x30 0x31 0x36 0x30 0x38 0x30 0x38 0x30 0x30 0x30 0x31 | 0x67     |

`0x17 0x01` - code of motor, that writes new serial number to motor\
`0x0C` - 12 bytes in data section\
`0x32 0x30 0x31 0x36 0x30 0x38 0x30 0x38 0x30 0x30 0x30 0x31` - `201608080001` by ASCII table - serial number of motor\
`0x67` - `(0x01 + 0x0C + 0x32 + 0x30 + 0x31 + 0x36 + 0x30 + 0x38 + 0x30 + 0x38 + 0x30 + 0x30 + 0x30 + 0x31) % 256`
#### Write Response

| Code |Data | Checksum |
|------|-----|----------|
| 0xXX |0xXX | 0xXX     |

`Code` is a special byte, that determines, on which request this frame responds.\
`Data` is a byte, that has a number of parameter in data in write request package that got error during writing (usually it means that value is too low or too big). If there are more than one incorrect parameter in package, this value will show only first error. If there is no error, this value will be equal to data length.\
`Checksum` can be calculated in such way: summ all `Code`, and `Data` and then take modulus of 256 from this number.\