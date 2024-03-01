import { UnitUser, Users } from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import { connection } from "../app"; 
import { PoolConnection, RowDataPacket } from "mysql2/promise";


export const loadUsers = async (): Promise<Users> => {
    const conn: PoolConnection = await connection;
    try {
        const [rows] = await conn.query('SELECT * FROM users') as [RowDataPacket[], any];
        if (!Array.isArray(rows)) return {};
        return rows.reduce((acc: Users, row: any) => {
            acc[row.id] = row;
            return acc;
        }, {});
    } catch (error) {
        console.log(`Error loading users: ${error}`);
        return {};
    }
};

export const saveUsers = async (users: Users): Promise<void> => {
    const conn: PoolConnection = await connection;
    try {
        await conn.query('TRUNCATE TABLE users'); // Clear existing users
        const values = Object.values(users).map(user => [user.id, user.username, user.email, user.password]);
        await conn.query('INSERT INTO users (id, username, email, password) VALUES ?', [values]);
        console.log('Users saved successfully!');
    } catch (error) {
        console.log(`Error saving users: ${error}`);
    }
};

export const findAll = async (): Promise<UnitUser[]> => {
    const conn: PoolConnection = await connection;
    const [rows] = await conn.query('SELECT * FROM users');
    return rows as UnitUser[];
};

export const findOne = async (id:string): Promise<UnitUser | null> => {
    const conn: PoolConnection = await connection;
    try {
        const [rows] = await conn.query('SELECT * FROM users WHERE id = ?', [id]) as [RowDataPacket[], any];
        if (!Array.isArray(rows)) return null;
        if (rows.length === 0) return null;
        return rows[0] as UnitUser;
    } catch (error) {
        console.log(`Error finding user: ${error}`);
        return null;
    }
};

export const search = async (): Promise<UnitUser[]> => {
    const conn: PoolConnection = await connection;
    try {
        const [rows] = await conn.query('SELECT * FROM users') as [RowDataPacket[], any];
        if (!Array.isArray(rows)) return [];
        return rows as UnitUser[];
    } catch (error) {
        console.log(`Error searching users: ${error}`);
        return [];
    }
};

export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
    const conn: PoolConnection = await connection;
    const id = random();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser: UnitUser = {
        ...userData,
        id,
        password: hashedPassword
    };
    await conn.query('INSERT INTO users SET ?', newUser);
    return newUser;
};

export const searchUsers = async (name: string, email: string): Promise<UnitUser[]> => {
    const conn: PoolConnection = await connection;
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];
    if (name) {
        query += ' AND username LIKE ?';
        params.push(`%${name}%`);
    }
    if (email) {
        query += ' AND email LIKE ?';
        params.push(`%${email}%`);
    }
    const [rows] = await conn.query(query, params);
    return rows as UnitUser[];
};

export const findbyEmail= async (user_email:string): Promise<UnitUser | null> => {
    const conn: PoolConnection = await connection;
    const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [user_email]) as [RowDataPacket[], any];;
    if (rows.length === 0) return null;
    return rows[0] as UnitUser;
};

export const comparePassword = async (email:string, supplied_password:string) : Promise<null | UnitUser> => {
    const user = await findbyEmail(email);
    if (!user) return null;
    const decryptPassword = await bcrypt.compare(supplied_password, user.password);
    if (!decryptPassword) return null;
    return user;
};

export const update = async (id: string, updateValues: UnitUser): Promise<UnitUser | null> => {
    const conn: PoolConnection = await connection;
    const existingUser = await findOne(id);
    if (!existingUser) return null;
    const updatedUser: UnitUser = { ...existingUser, ...updateValues };
    if (updateValues.password) {
        const salt = await bcrypt.genSalt(10);
        updatedUser.password = await bcrypt.hash(updateValues.password, salt);
    }
    await conn.query('UPDATE users SET ? WHERE id = ?', [updatedUser, id]);
    return updatedUser;
};

export const remove = async (id:string) : Promise<void> => {
    const conn: PoolConnection = await connection;
    await conn.query('DELETE FROM users WHERE id = ?', [id]);
};
