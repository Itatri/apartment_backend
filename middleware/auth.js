import jwt from 'jsonwebtoken';

export const verifyToken = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Not you role' });
            }

            req.user = decoded;
            next();
        }
        catch (err) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }
}