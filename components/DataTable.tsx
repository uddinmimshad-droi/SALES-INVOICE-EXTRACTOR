
import React from 'react';

interface Column<T> {
  key: keyof T;
  name: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

const DataTable = <T extends object,>(props: DataTableProps<T>): React.ReactElement => {
  const { columns, data } = props;

  if (data.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <p className="text-slate-500 dark:text-slate-400">No data available to display.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              {columns.map((col) => (
                <td key={`${rowIndex}-${String(col.key)}`} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
