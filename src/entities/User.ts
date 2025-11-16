import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type UserRole = 'admin' | 'user';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'full_name' })
    fullName!: string;

    @Column({ name: 'birth_date', type: 'date', nullable: true })
    birthDate?: string;

    @Index({ unique: true })
    @Column({ unique: true })
    email!: string;

    @Column({ name: 'password_hash' })
    passwordHash!: string;

    @Column({ type: 'varchar', default: 'user' })
    role!: UserRole;

    @Column({ name: 'is_active', default: true })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
