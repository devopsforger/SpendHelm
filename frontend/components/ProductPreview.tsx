import MockStatCard from './ui/MockStatCard';
import MockExpenseRow from './ui/MockExpenseRow';

export default function ProductPreview() {
  const mockStats = [
    { label: "Today", value: "$47.50" },
    { label: "This Week", value: "$312.80" },
    { label: "This Month", value: "$1,247.35" }
  ];

  const mockExpenses = [
    { category: "Groceries", amount: "$62.40", date: "Today" },
    { category: "Transport", amount: "$15.00", date: "Today" },
    { category: "Coffee", amount: "$4.50", date: "Yesterday" }
  ];

  const chartData = [40, 65, 45, 80, 55, 70, 50];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-[#101828] mb-4">
            A dashboard that respects your time
          </h2>
          <p className="text-gray-600">{`Everything you need to see, nothing you don't.`}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
          </div>
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {mockStats.map((stat, index) => (
                <MockStatCard
                  key={index}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-end justify-between h-32 gap-2">
                {chartData.map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-[#551931]/20 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-400">
                      {days[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {mockExpenses.map((expense, index) => (
                <MockExpenseRow
                  key={index}
                  category={expense.category}
                  amount={expense.amount}
                  date={expense.date}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}