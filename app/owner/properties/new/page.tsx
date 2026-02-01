
import { PropertyWizard } from '@/components/properties/property-wizard'

export default function NewPropertyPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-black tracking-tight text-[#0B3D6F] mb-2 px-4">List Your Property</h1>
            <p className="text-muted-foreground px-4 mb-6">Complete the steps below to publish your home on DARLINK.</p>
            <PropertyWizard />
        </div>
    )
}
