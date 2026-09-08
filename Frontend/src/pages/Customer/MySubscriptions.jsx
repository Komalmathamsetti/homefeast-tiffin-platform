import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getMySubscriptions,
  cancelSubscription,
} from "../../services/subscriptionServices";
import Swal from "sweetalert2";
import { getImageUrl } from "../../utils/imageUrl";
const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
  active: "bg-green-100 text-green-700 ring-green-200",
  rejected: "bg-red-100 text-red-700 ring-red-200",
  cancelled: "bg-red-100 text-red-700 ring-red-200",
  expired: "bg-gray-100 text-gray-600 ring-gray-200",
};

const statusLabels = {
  pending: "Pending",
  active: "Active",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
};

function FeatureItem({ children }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-50 text-orange-500">
        ✓
      </span>
      <span>{children}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="animate-pulse space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-3 w-1/4 rounded bg-slate-200" />
          </div>
          <div className="h-8 w-24 rounded-full bg-slate-200" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-200" />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function SubscriptionCard({ subscription, onCancel }) {
  const isActive = subscription.status === "active";
  const isPending = subscription.status === "pending";
  const isRejected = subscription.status === "rejected";
  const isCancelled = subscription.status === "cancelled";
  return (
    <div className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4">
          <img
            src={subscription.cookAvatar}
            alt={subscription.cookName}
            className="h-16 w-16 rounded-full object-cover ring-4 ring-orange-50"
          />

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {subscription.cookName}
            </h3>
            <p className="text-sm text-slate-500">{subscription.cuisine}</p>
          </div>
        </div>

        <div className="sm:ml-auto">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[subscription.status] || statusStyles.expired} transition-all duration-300`}
          >
            {statusLabels[subscription.status] || "Expired"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <InfoRow label="Meal Plan" value={subscription.mealPlan} />
        <InfoRow label="Price" value={subscription.price} />
        <InfoRow label="Service Area" value={subscription.serviceArea} />
        <InfoRow
          label="Delivery Timings"
          value={subscription.deliveryTimings}
        />
        <InfoRow label="Start Date" value={subscription.startDate} />
        <InfoRow label="Cuisine" value={subscription.cuisine} />
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <FeatureItem>Homemade Food</FeatureItem>
        <FeatureItem>Fresh Ingredients</FeatureItem>
        <FeatureItem>Hygienic Kitchen</FeatureItem>
        <FeatureItem>Doorstep Delivery</FeatureItem>
      </div>

      <div className="mt-6">
        {isActive && (
          <button
            onClick={() => onCancel(subscription.id)}
            className="w-full rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-red-600 hover:shadow-md"
          >
            Cancel Subscription
          </button>
        )}
        {isRejected && (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-2xl bg-red-100 px-4 py-3 font-semibold text-red-700"
          >
            Subscription Rejected
          </button>
        )}

        {isPending && (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-2xl bg-yellow-100 px-4 py-3 font-semibold text-yellow-700 opacity-90"
          >
            Waiting for Cook Approval
          </button>
        )}

        {isCancelled && (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-500"
          >
            Subscription Cancelled
          </button>
        )}

        {!isActive && !isPending && !isRejected && !isCancelled && (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-500"
          >
            Subscription Expired
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-100">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50">
        <span className="text-4xl">🍲</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-900">
        No Active Subscriptions
      </h2>
      <p className="mx-auto mt-3 max-w-md text-slate-500">
        You don’t have any meal subscriptions right now. Discover home cooks and
        start a fresh plan anytime.
      </p>
      <button
        onClick={() => navigate("/browse-cooks")}
        className="mt-8 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-orange-600 hover:shadow-md"
      >
        Browse Home Cooks
      </button>
    </div>
  );
}

export default function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active",
  ).length;
  const cancelledSubscriptions = subscriptions.filter(
    (s) => s.status === "cancelled",
  ).length;
  const fetchSubscriptions = async () => {
    try {
      const data = await getMySubscriptions();
      const formattedSubscriptions = data.map((subscription) => ({
        id: subscription.id,
        cookName: subscription.name,
        mealPlan: subscription.plan_type,
        status: subscription.status.toLowerCase(),
        startDate: new Date(subscription.start_date).toLocaleDateString(),
        serviceArea: subscription.service_area,
        deliveryTimings: subscription.delivery_timings,
        cuisine: subscription.cuisine,
        price: `₹${subscription.price}`,
        cookAvatar: subscription.image_url
          ? getImageUrl(subscription.image_url)
          : "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=300&q=80",
      }));
      setSubscriptions(formattedSubscriptions);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const loadSubscriptions = async () => {
      await fetchSubscriptions();
    };
    loadSubscriptions();
    const interval = setInterval(() => {
      fetchSubscriptions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  const handleCancelSubscription = async (id) => {
    const result = await Swal.fire({
      title: "Cancel Subscription?",
      text: "Are you sure you want to cancel this subscription?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "Keep Subscription",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await cancelSubscription(id);

      await Swal.fire({
        title: "Cancelled!",
        text: "Your subscription has been cancelled successfully.",
        icon: "success",
        confirmButtonColor: "#f97316",
      });

      fetchSubscriptions();
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Cancellation Failed",
        text:
          error.response?.data?.message || "Unable to cancel the subscription.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    }
  };
  return (
    <div className="min-h-screen bg-[#FFF9F5] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-white shadow-lg shadow-orange-200">
            HF
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">HomeFeast</p>
            <p className="text-xs text-slate-500">
              Fresh meals, delivered with care
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/customer/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-orange-500"
          >
            Back to Dashboard
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Subscriptions
            </h1>
            <p className="mt-2 text-slate-600">
              Manage your active and previous meal subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:min-w-90">
            <SummaryStat
              label="Total Subscriptions"
              value={totalSubscriptions}
            />
            <SummaryStat
              label="Active Subscriptions"
              value={activeSubscriptions}
            />
            <SummaryStat
              label="Cancelled Subscriptions"
              value={cancelledSubscriptions}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onCancel={handleCancelSubscription}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-orange-50 px-4 py-3 text-center">
      <div className="text-2xl font-bold text-orange-600">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-600">{label}</div>
    </div>
  );
}
