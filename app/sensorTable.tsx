import { useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from '@heroui/react';
import { Sensor } from './page';

const columns = [
  { key: 'sensorSuhuAir', label: 'Suhu Air' },
  { key: 'sensorSuhu', label: 'Suhu' },
  { key: 'sensorPPM', label: 'PPM' },
  { key: 'sensorPh', label: 'pH' },
  { key: 'lastUpdate', label: 'Waktu Update' },
];

const getKeyValue = (item: Sensor, key: string) => {
  return (item as any)[key];
};

export default function SensorTable({ data }: { data: Sensor[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Table aria-label="Table data hidroponik">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={paginatedData}>
          {(item) => (
            <TableRow key={item.lastUpdate}>
              {(columnKey) => <TableCell>{getKeyValue(item, columnKey.toString())}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4">
        <Pagination
          page={currentPage}
          total={totalPages}
          onChange={setCurrentPage}
          showControls
        />
      </div>
    </>
  );
}
