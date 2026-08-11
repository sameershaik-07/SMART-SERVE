const { registerSchema, loginSchema } = require("./auth.validation");
const authService = require("./auth.service");

const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const user = await authService.registerUser(validatedData);

        return res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(400).json({
        message: error.message
    });
}
};


const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await authService.loginUser(validatedData);

        return res.status(200).json({
            message: "Login successful",
            user
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};


module.exports = {
    register,
    login
};