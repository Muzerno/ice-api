import { Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CredentialService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.getUserByUsername(username);
        if (!user) {
            return null;
        }
        const isValid = await this.usersService.validatePassword(user.username, password);
        if (!isValid) {
            return null;
        }
        return user;
    }

    async login(user: any) {
        const payload = { user: user };
        return payload
        // return {
        //     access_token: await this.jwtService.signAsync(payload),
        // };
    }
}