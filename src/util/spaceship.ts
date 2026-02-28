const spaceship = <T>(a: T, b: T) => {
    switch (true) {
        case a < b:
            return -1;
        case a > b:
            return 1;
        case a === b:
        default:
            return 0;
    }
};

export default spaceship;
