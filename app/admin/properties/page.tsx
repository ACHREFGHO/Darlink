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
import { PropertyActions } from "@/components/admin/property-actions"

export default async function AdminPropertiesPage() {
    const supabase = await createClient()

    const { data: properties, error } = await supabase
        .from('properties')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-4 text-red-500">Error loading properties: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Properties</h1>
                <p className="text-muted-foreground">Manage and review all property listings.</p>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {properties?.map((prop) => (
                            <TableRow key={prop.id}>
                                <TableCell className="font-medium">{prop.title}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{prop.profiles?.full_name}</span>
                                        <span className="text-xs text-muted-foreground">{prop.profiles?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{prop.city}, {prop.governorate}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        prop.status === 'Published' ? 'default' :
                                            prop.status === 'Rejected' ? 'destructive' :
                                                'secondary' // Pending
                                    } className={
                                        prop.status === 'Published' ? 'bg-green-600 hover:bg-green-700' : ''
                                    }>
                                        {prop.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{prop.type}</TableCell>
                                <TableCell className="text-right">
                                    <PropertyActions
                                        propertyId={prop.id}
                                        ownerId={prop.owner_id}
                                        propertyTitle={prop.title}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
