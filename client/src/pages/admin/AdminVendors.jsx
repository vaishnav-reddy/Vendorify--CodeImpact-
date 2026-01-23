import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, BadgeX } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Card, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';

const AdminVendors = () => {
  const navigate = useNavigate();
  const { vendors, setVendorVerified } = useAppData();

  return (
    <div className="min-h-screen bg-gray-50 max-w-mobile mx-auto md:max-w-tablet lg:max-w-desktop pb-20">
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <button onClick={() => navigate('/admin')} className="flex items-center text-sm text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <div className="font-bold text-gray-900">Vendors</div>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-3">
        {!vendors.length ? (
          <div className="text-sm text-gray-600">No vendors found.</div>
        ) : (
          vendors.map((v) => (
            <Card key={v.id} hoverEffect>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{v.name}</div>
                    <div className="text-xs text-gray-500 truncate">{v.address}</div>
                    <div className="mt-2">
                      {v.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          <BadgeCheck size={14} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                          <BadgeX size={14} /> Not Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {v.verified ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setVendorVerified({ vendorId: v.id, verified: false })}
                      >
                        Unverify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setVendorVerified({ vendorId: v.id, verified: true })}
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminVendors;
