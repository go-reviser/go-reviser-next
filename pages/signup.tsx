import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function SignUp() {
    const { signUp, user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await signUp(name, email, password);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-72px)] flex items-center justify-center">
            <div className="w-[65%] flex flex-col md:flex-row bg-white rounded-3xl shadow-lg">
                {/* Form Section */}
                <div className="w-full md:w-2/3 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-md w-full mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Sign up
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <div className="relative">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border-b-2 border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-500 peer"
                                        placeholder="Your Name"
                                    />
                                    <label
                                        htmlFor="name"
                                        className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all 
                                        peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2
                                        peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                    >
                                        Your Name
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full px-3 py-2 border-b-2 border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-500 peer"
                                        placeholder="Your Email"
                                    />
                                    <label
                                        htmlFor="email"
                                        className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all 
                                        peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2
                                        peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                    >
                                        Your Email
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full px-3 py-2 border-b-2 border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-500 peer"
                                        placeholder="Password"
                                    />
                                    <label
                                        htmlFor="password"
                                        className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all 
                                        peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2
                                        peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                    >
                                        Password
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="w-full px-3 py-2 border-b-2 border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-500 peer"
                                        placeholder="Repeat your password"
                                    />
                                    <label
                                        htmlFor="confirmPassword"
                                        className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all 
                                        peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2
                                        peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                    >
                                        Repeat your password
                                    </label>
                                </div>
                            </div>

                            {/* I agree all statements in Terms of service */}
                            {/* <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                                    I agree all statements in{' '}
                                    <Link href="/terms" className="text-blue-500 hover:text-blue-400">
                                        Terms of service
                                    </Link>
                                </label>
                            </div> */}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Registering...' : 'Register'}
                                </button>
                            </div>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            <Link href="/signin" className="text-blue-500 hover:text-blue-400">
                                I am already member
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Image Section */}
                <div className="hidden md:flex md:w-1/3 bg-white items-center justify-center p-8">
                    <div className="w-5/6">
                        <img
                            src="/images/table-chair-under-tree.jpg"
                            alt="Desk illustration"
                            className="w-full h-auto rounded-3xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 