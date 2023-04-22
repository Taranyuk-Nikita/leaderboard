const makeDrawing = (number_of_members) => {
    let order = []
    while (order.length < number_of_members) {
        let randNum = Math.ceil(Math.random() * number_of_members)
        let check = true
        for (let i = 0; i < order.length; i++) {
            if (order[i] === randNum) {
                check = false
                break
            }
        }
        if (check) order.push(randNum)
    } 
    return order
}
