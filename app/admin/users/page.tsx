import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-4 text-red-500">Error loading users: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users Management</h1>
                <p className="text-muted-foreground">View and manage all registered users.</p>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Properties</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.full_name || 'No Name'}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'house_owner' ? 'outline' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.is_approved ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Approved</Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">Standard</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* Ideally we fetch property count here or join it */}
                                    -
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
