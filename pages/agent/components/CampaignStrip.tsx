import { Calendar, Gift } from 'lucide-react';
import React from 'react';
import { FlashSaleCampaign } from '../../../types';

type Props = {
  campaigns: FlashSaleCampaign[];
  onJoinCampaign: (campaign: FlashSaleCampaign) => void;
};

const CampaignsStrip: React.FC<Props> = ({ campaigns, onJoinCampaign }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-bold flex items-center mb-2">
          <Gift className="w-6 h-6 mr-3 text-yellow-400" /> Active Campaigns
        </h2>
        <p className="text-indigo-200 text-sm max-w-xl">
          Boost your sales by joining our exclusive promotional events. Enjoy reduced platform fees
          and higher visibility.
        </p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar relative z-10">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="min-w-[300px] bg-white text-gray-900 rounded-2xl p-4 shadow-lg flex flex-col"
          >
            <div className="h-32 rounded-xl overflow-hidden mb-4 relative">
              <img src={campaign.image} className="w-full h-full object-cover" alt="" />
              <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                {campaign.isActive ? 'Active' : 'Ended'}
              </div>
            </div>

            <h3 className="font-bold text-lg mb-1">{campaign.name}</h3>
            <div className="flex items-center text-xs text-gray-500 mb-4">
              <Calendar className="w-3 h-3 mr-1" /> {campaign.startDate} - {campaign.endDate}
            </div>

            <div className="mt-auto space-y-3">
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Min. Discount</span>
                  <span className="font-bold text-red-500">{campaign.minDiscount}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Admin Fee</span>
                  <span className="font-bold text-green-600">
                    {campaign.adminFeePercentage}% (Save {11 - campaign.adminFeePercentage}%)
                  </span>
                </div>
              </div>

              <button
                onClick={() => onJoinCampaign(campaign)}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Join Campaign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignsStrip;
