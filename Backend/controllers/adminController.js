const normalizeEmail = (email) => email.trim().toLowerCase();

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL
      ? normalizeEmail(process.env.ADMIN_EMAIL)
      : "";
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({
        message: "Admin credentials are not configured."
      });
    }

    const emailMatch = normalizeEmail(email) === adminEmail;
    const passwordMatch = password === adminPassword;

    if (!emailMatch || !passwordMatch) {
      return res.status(401).json({
        message: "Invalid admin credentials."
      });
    }

    return res.json({
      message: "Admin login successful.",
      user: {
        email: adminEmail,
        role: "admin"
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to login."
    });
  }
};
