
/*
    This contains the API for zkLocus. The API is designed to abstract away the underlying zero-knowledge circutiry logic, and focus
    on providing a clear, concise and intuitive API for the end user. The API is designed adehering to the vision of zkLocus of allowing
    for the sharing of optionally private geolocation data, that is extendable, customizable, and interoperable across the varioius
    computational environments, such as blockchain (on-chain), off-chain, mobile, web and IoT.

    The API's design levarages the recursive zkSNARKs architecture o zkLocus to its fullest extent. As such, the proofs are
    naturally recursive and combinable with one another, just like in the low-level zkLocus API.

    This API is designed specifically for TypeScript, and it's inspired by APIs in the Python ecosystem such as BeautifulSoup, where powerful
    and complex functionality is abstracted away from the user, while exposing a clear and concise interface to the end user.
*/


// Utility Types
export type InputNumber = number | string; // Represents the number type

// Named Tuple Equivalent in TypeScript
export interface RawCoordinates {
    latitude: InputNumber;
    longitude: InputNumber;
}

