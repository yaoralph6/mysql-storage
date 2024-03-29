    import express, {Request, Response} from "express"
    import {UnitUser, User} from "./user.interface"
    import { StatusCodes } from "http-status-codes"
    import * as database from "./user.database"
    import { searchUsers } from "./user.database";
    import { parseJsonSourceFileConfigFileContent } from "typescript"

    export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response) => {
    try {
        const allUsers: UnitUser[] = await database.findAll();

        if (!allUsers || allUsers.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'No users found' });
        }

        return res.status(StatusCodes.OK).json({ total_users: allUsers.length, users: allUsers });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
});

    userRouter.get("/users/search", async (req: Request, res: Response) => {
        try {
    
            const name = req.query.name as string;
            const email = req.query.email as string;
    
            const users = await searchUsers(name, email);
    
            return res.status(StatusCodes.OK).json({ users });
        } catch (error) {
            return res.status(StatusCodes.NOT_FOUND).json( ["User not found"] );
        }
    });



    userRouter.get("/user/:id", async (req: Request, res: Response) => {
        try {
            const userId = req.params.id;
            const user: UnitUser | null = await database.findOne(userId);
    
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
            }
    
            return res.status(StatusCodes.OK).json({ user });
        } catch (error) {
            console.error("Error fetching user:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
        }
    });


    userRouter.post("/register", async (req : Request, res : Response) => {

        try {
            const {username, email, password} = req.body

            if (!username || !email || !password) {
                return res.status(StatusCodes.BAD_REQUEST).json({error : 'Please provide all the required parameters.. '})
            }
        
            const user = await database.findbyEmail(email)

            if (user) {
                return res.status(StatusCodes.BAD_REQUEST).json({error : 'This email has already been registered'})
            }
            
            const newUser = await database.create(req.body)

            return res.status(StatusCodes.CREATED).json({newUser})
        }
        catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
        }
    })

    userRouter.post("/login", async (req : Request, res : Response) => {

        try {
            const {email, password} = req.body

            if (!email || !password) {
                return res.status(StatusCodes.BAD_REQUEST).json({error : 'Please provide all the required parameters..'})
            }
            
            const user = await database.findbyEmail(email)

            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({error : 'No user exists with this email..'})
            }

            const comparePassword = await database.comparePassword(email, password)

            if (!comparePassword) {
                return res.status(StatusCodes.BAD_REQUEST).json({error : 'Incorrect password!'})
            }

            return res.status(StatusCodes.OK).json({user})
        }

        catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
        }
    } )

    userRouter.put("/user/:id", async (req: Request, res: Response) => {

        try {
          const { username, email, password } = req.body
      
          const user: UnitUser | null = await database.findOne(req.params.id)
      
          if (!username || !email || !password) {
            return res.status(401).json({ error: 'Please provide all the required parameters..' })
          }
      
          if (!user) {
            return res.status(404).json({ error: `No user with this id ${req.params.id}` })
          }
      
          // Handle potential database update errors (assuming update is not synchronous)
          await database.update((req.params.id), req.body).catch(error => {
            console.error(error)
            return res.status(500).json({ error: 'An error occurred while updating the user' })
          })
      
          // Assuming database.update returns the updated user:
          const updatedUser = user // Update this with the actual updated user from the database
      
          return res.status(201).json({ updatedUser })
        } catch (error) {
          console.error(error)
          return res.status(500).json({ error: 'An unexpected error occurred' })
        }
      })

    userRouter.delete("/user/:id", async (req : Request, res : Response) => {

        try {
            const id = (req.params.id)

            const user = await database.findOne(id)

            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({error : 'User does not exist'})
            }

            await database.remove(id)

            return res.status(StatusCodes.OK).json({msg : 'User Deleted'})
        }
        catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
        }
    })

    //Doesn't work for some reason, returns all users instead of specific ones
    /* 
    userRouter.get("/users/search", async (req: Request, res: Response) => {
        try {
          const { name, email } = req.query;
      
          if (name) {
            const user = await database.findByName(name.toString());
            if (!user) {
              return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
            }
            return res.status(StatusCodes.OK).json({ user });
          }
      
          if (email) {
            const user = await database.findbyEmail(email.toString());
            if (!user) {
              return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
            }
            return res.status(StatusCodes.OK).json({ user });
          }
      
        
          return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide name or email query parameter' });
      
        } catch (error) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
        }
      });
*/
      

