/**
 * ============================================
 * SUBJECT MAPPING
 * ============================================
 * 
 * Purpose: Centralized subject data and helper functions
 * Used by: Teacher, Student, and Admin modules for subject lookups
 * 
 * Features:
 * - Complete subject list with IDs, names, class sections, and assigned teachers
 * - Helper functions for subject name and class lookup
 * 
 * Data Structure:
 * {
 *   id: number,           // Unique subject identifier
 *   subject_name: string, // Subject display name
 *   class_section: number // Associated class section ID
 *   assigned_teacher: number | null // Teacher ID (null if unassigned)
 * }
 * ============================================
 */

/**
 * Complete subject list for all classes
 * 
 * Subjects include:
 * - Biology, Chemistry, Computer Science, English
 * - Islamiat, Mathematics, Physics, Science
 * - Social Studies, Urdu
 * 
 * Each subject is associated with a specific class section
 * and may have an assigned teacher (or null if unassigned)
 */
export const SUBJECT_LIST = [
    { "id": 1380, "subject_name": "Biology", "class_section": 199, "assigned_teacher": 165 },
    { "id": 1420, "subject_name": "Biology", "class_section": 204, "assigned_teacher": 157 },
    { "id": 1356, "subject_name": "Biology", "class_section": 196, "assigned_teacher": 163 },
    { "id": 1452, "subject_name": "Biology", "class_section": 208, "assigned_teacher": 154 },
    { "id": 1404, "subject_name": "Biology", "class_section": 202, "assigned_teacher": 170 },
    { "id": 1460, "subject_name": "Biology", "class_section": 209, "assigned_teacher": 171 },
    { "id": 1428, "subject_name": "Biology", "class_section": 205, "assigned_teacher": 161 },
    { "id": 1364, "subject_name": "Biology", "class_section": 197, "assigned_teacher": 176 },
    { "id": 1372, "subject_name": "Biology", "class_section": 198, "assigned_teacher": 159 },
    { "id": 1436, "subject_name": "Biology", "class_section": 206, "assigned_teacher": 157 },
    { "id": 1412, "subject_name": "Biology", "class_section": 203, "assigned_teacher": 164 },
    { "id": 1468, "subject_name": "Biology", "class_section": 182, "assigned_teacher": 195 },
    { "id": 1444, "subject_name": "Biology", "class_section": 207, "assigned_teacher": 176 },
    { "id": 1396, "subject_name": "Biology", "class_section": 201, "assigned_teacher": 167 },
    { "id": 1443, "subject_name": "Chemistry", "class_section": 207, "assigned_teacher": 173 },
    { "id": 1371, "subject_name": "Chemistry", "class_section": 198, "assigned_teacher": 165 },
    { "id": 1467, "subject_name": "Chemistry", "class_section": 210, "assigned_teacher": 156 },
    { "id": 1435, "subject_name": "Chemistry", "class_section": 206, "assigned_teacher": 161 },
    { "id": 1419, "subject_name": "Chemistry", "class_section": 204, "assigned_teacher": 155 },
    { "id": 1395, "subject_name": "Chemistry", "class_section": 201, "assigned_teacher": 169 },
    { "id": 1427, "subject_name": "Chemistry", "class_section": 205, "assigned_teacher": 168 },
    { "id": 1403, "subject_name": "Chemistry", "class_section": 202, "assigned_teacher": 157 },
    { "id": 1459, "subject_name": "Chemistry", "class_section": 209, "assigned_teacher": 154 },
    { "id": 1379, "subject_name": "Chemistry", "class_section": 199, "assigned_teacher": 156 },
    { "id": 1363, "subject_name": "Chemistry", "class_section": 197, "assigned_teacher": 166 },
    { "id": 1451, "subject_name": "Chemistry", "class_section": 208, "assigned_teacher": 153 },
    { "id": 1387, "subject_name": "Chemistry", "class_section": 200, "assigned_teacher": 154 },
    { "id": 1355, "subject_name": "Chemistry", "class_section": 196, "assigned_teacher": 168 },
    { "id": 1411, "subject_name": "Chemistry", "class_section": 203, "assigned_teacher": 172 },
    { "id": 1437, "subject_name": "Computer Science", "class_section": 206, "assigned_teacher": 161 },
    { "id": 1357, "subject_name": "Computer Science", "class_section": 196, "assigned_teacher": 164 },
    { "id": 1453, "subject_name": "Computer Science", "class_section": 208, "assigned_teacher": 175 },
    { "id": 1421, "subject_name": "Computer Science", "class_section": 204, "assigned_teacher": 160 },
    { "id": 1469, "subject_name": "Computer Science", "class_section": 210, "assigned_teacher": 156 },
    { "id": 1397, "subject_name": "Computer Science", "class_section": 201, "assigned_teacher": 173 },
    { "id": 1413, "subject_name": "Computer Science", "class_section": 203, "assigned_teacher": 175 },
    { "id": 1461, "subject_name": "Computer Science", "class_section": 209, "assigned_teacher": 174 },
    { "id": 1405, "subject_name": "Computer Science", "class_section": 202, "assigned_teacher": 164 },
    { "id": 1373, "subject_name": "Computer Science", "class_section": 198, "assigned_teacher": 165 },
    { "id": 1389, "subject_name": "Computer Science", "class_section": 200, "assigned_teacher": 175 },
    { "id": 1429, "subject_name": "Computer Science", "class_section": 205, "assigned_teacher": 168 },
    { "id": 1381, "subject_name": "Computer Science", "class_section": 199, "assigned_teacher": 163 },
    { "id": 1445, "subject_name": "Computer Science", "class_section": 207, "assigned_teacher": 160 },
    { "id": 1365, "subject_name": "Computer Science", "class_section": 197, "assigned_teacher": 171 },
    { "id": 1316, "subject_name": "English", "class_section": 190, "assigned_teacher": 167 },
    { "id": 1280, "subject_name": "English", "class_section": 184, "assigned_teacher": 172 },
    { "id": 1376, "subject_name": "English", "class_section": 199, "assigned_teacher": 163 },
    { "id": 1400, "subject_name": "English", "class_section": 202, "assigned_teacher": 158 },
    { "id": 1464, "subject_name": "English", "class_section": 210, "assigned_teacher": 162 },
    { "id": 1384, "subject_name": "English", "class_section": 200, "assigned_teacher": 161 },
    { "id": 1274, "subject_name": "English", "class_section": 183, "assigned_teacher": null },
    { "id": 1392, "subject_name": "English", "class_section": 201, "assigned_teacher": 152 },
    { "id": 1292, "subject_name": "English", "class_section": 186, "assigned_teacher": null },
    { "id": 1286, "subject_name": "English", "class_section": 185, "assigned_teacher": 153 },
    { "id": 1456, "subject_name": "English", "class_section": 209, "assigned_teacher": 164 },
    { "id": 1262, "subject_name": "English", "class_section": 181, "assigned_teacher": 170 },
    { "id": 1298, "subject_name": "English", "class_section": 187, "assigned_teacher": 171 },
    { "id": 1448, "subject_name": "English", "class_section": 208, "assigned_teacher": 155 },
    { "id": 1268, "subject_name": "English", "class_section": 182, "assigned_teacher": 165 },
    { "id": 1304, "subject_name": "English", "class_section": 188, "assigned_teacher": 156 },
    { "id": 1310, "subject_name": "English", "class_section": 189, "assigned_teacher": 157 },
    { "id": 1440, "subject_name": "English", "class_section": 207, "assigned_teacher": 156 },
    { "id": 1322, "subject_name": "English", "class_section": 191, "assigned_teacher": 164 },
    { "id": 1432, "subject_name": "English", "class_section": 206, "assigned_teacher": 161 },
    { "id": 1328, "subject_name": "English", "class_section": 192, "assigned_teacher": 174 },
    { "id": 1346, "subject_name": "English", "class_section": 195, "assigned_teacher": null },
    { "id": 1424, "subject_name": "English", "class_section": 205, "assigned_teacher": 173 },
    { "id": 1340, "subject_name": "English", "class_section": 194, "assigned_teacher": 155 },
    { "id": 1416, "subject_name": "English", "class_section": 204, "assigned_teacher": 163 },
    { "id": 1352, "subject_name": "English", "class_section": 196, "assigned_teacher": 173 },
    { "id": 1360, "subject_name": "English", "class_section": 197, "assigned_teacher": 169 },
    { "id": 1408, "subject_name": "English", "class_section": 203, "assigned_teacher": 158 },
    { "id": 1334, "subject_name": "English", "class_section": 193, "assigned_teacher": null },
    { "id": 1368, "subject_name": "English", "class_section": 198, "assigned_teacher": 158 },
    { "id": 1430, "subject_name": "Islamiat", "class_section": 205, "assigned_teacher": 166 },
    { "id": 1320, "subject_name": "Islamiat", "class_section": 190, "assigned_teacher": 172 },
    { "id": 1382, "subject_name": "Islamiat", "class_section": 199, "assigned_teacher": 154 },
    { "id": 1344, "subject_name": "Islamiat", "class_section": 194, "assigned_teacher": 167 },
    { "id": 1374, "subject_name": "Islamiat", "class_section": 198, "assigned_teacher": 165 },
    { "id": 1414, "subject_name": "Islamiat", "class_section": 203, "assigned_teacher": 168 },
    { "id": 1314, "subject_name": "Islamiat", "class_section": 189, "assigned_teacher": 170 },
    { "id": 1350, "subject_name": "Islamiat", "class_section": 195, "assigned_teacher": 158 },
    { "id": 1438, "subject_name": "Islamiat", "class_section": 206, "assigned_teacher": 173 },
    { "id": 1284, "subject_name": "Islamiat", "class_section": 184, "assigned_teacher": 166 },
    { "id": 1308, "subject_name": "Islamiat", "class_section": 188, "assigned_teacher": 165 },
    { "id": 1446, "subject_name": "Islamiat", "class_section": 207, "assigned_teacher": 161 },
    { "id": 1302, "subject_name": "Islamiat", "class_section": 187, "assigned_teacher": 166 },
    { "id": 1296, "subject_name": "Islamiat", "class_section": 186, "assigned_teacher": 165 },
    { "id": 1454, "subject_name": "Islamiat", "class_section": 208, "assigned_teacher": 175 },
    { "id": 1358, "subject_name": "Islamiat", "class_section": 196, "assigned_teacher": 173 },
    { "id": 1278, "subject_name": "Islamiat", "class_section": 183, "assigned_teacher": 165 },
    { "id": 1462, "subject_name": "Islamiat", "class_section": 209, "assigned_teacher": 155 },
    { "id": 1390, "subject_name": "Islamiat", "class_section": 200, "assigned_teacher": 165 },
    { "id": 1406, "subject_name": "Islamiat", "class_section": 202, "assigned_teacher": 172 },
    { "id": 1266, "subject_name": "Islamiat", "class_section": 181, "assigned_teacher": 156 },
    { "id": 1272, "subject_name": "Islamiat", "class_section": 182, "assigned_teacher": 167 },
    { "id": 1332, "subject_name": "Islamiat", "class_section": 192, "assigned_teacher": 171 },
    { "id": 1290, "subject_name": "Islamiat", "class_section": 185, "assigned_teacher": 167 },
    { "id": 1366, "subject_name": "Islamiat", "class_section": 197, "assigned_teacher": 165 },
    { "id": 1422, "subject_name": "Islamiat", "class_section": 204, "assigned_teacher": 169 },
    { "id": 1326, "subject_name": "Islamiat", "class_section": 191, "assigned_teacher": 152 },
    { "id": 1338, "subject_name": "Islamiat", "class_section": 193, "assigned_teacher": 160 },
    { "id": 1470, "subject_name": "Islamiat", "class_section": 210, "assigned_teacher": 154 },
    { "id": 1398, "subject_name": "Islamiat", "class_section": 201, "assigned_teacher": 159 },
    { "id": 1261, "subject_name": "Mathematics", "class_section": 181, "assigned_teacher": 155 },
    { "id": 1267, "subject_name": "Mathematics", "class_section": 182, "assigned_teacher": 162 },
    { "id": 1273, "subject_name": "Mathematics", "class_section": 183, "assigned_teacher": 174 },
    { "id": 1279, "subject_name": "Mathematics", "class_section": 184, "assigned_teacher": 165 },
    { "id": 1285, "subject_name": "Mathematics", "class_section": 185, "assigned_teacher": 162 },
    { "id": 1291, "subject_name": "Mathematics", "class_section": 186, "assigned_teacher": 154 },
    { "id": 1297, "subject_name": "Mathematics", "class_section": 187, "assigned_teacher": 156 },
    { "id": 1303, "subject_name": "Mathematics", "class_section": 188, "assigned_teacher": 166 },
    { "id": 1309, "subject_name": "Mathematics", "class_section": 189, "assigned_teacher": 153 },
    { "id": 1315, "subject_name": "Mathematics", "class_section": 190, "assigned_teacher": 156 },
    { "id": 1321, "subject_name": "Mathematics", "class_section": 191, "assigned_teacher": 172 },
    { "id": 1327, "subject_name": "Mathematics", "class_section": 192, "assigned_teacher": 175 },
    { "id": 1333, "subject_name": "Mathematics", "class_section": 193, "assigned_teacher": 175 },
    { "id": 1339, "subject_name": "Mathematics", "class_section": 194, "assigned_teacher": 170 },
    { "id": 1345, "subject_name": "Mathematics", "class_section": 195, "assigned_teacher": 168 },
    { "id": 1351, "subject_name": "Mathematics", "class_section": 196, "assigned_teacher": 172 },
    { "id": 1359, "subject_name": "Mathematics", "class_section": 197, "assigned_teacher": 160 },
    { "id": 1367, "subject_name": "Mathematics", "class_section": 198, "assigned_teacher": 153 },
    { "id": 1375, "subject_name": "Mathematics", "class_section": 199, "assigned_teacher": 161 },
    { "id": 1383, "subject_name": "Mathematics", "class_section": 200, "assigned_teacher": 173 },
    { "id": 1399, "subject_name": "Mathematics", "class_section": 202, "assigned_teacher": 168 },
    { "id": 1407, "subject_name": "Mathematics", "class_section": 203, "assigned_teacher": 161 },
    { "id": 1415, "subject_name": "Mathematics", "class_section": 204, "assigned_teacher": 155 },
    { "id": 1423, "subject_name": "Mathematics", "class_section": 205, "assigned_teacher": 169 },
    { "id": 1431, "subject_name": "Mathematics", "class_section": 206, "assigned_teacher": 165 },
    { "id": 1439, "subject_name": "Mathematics", "class_section": 207, "assigned_teacher": 153 },
    { "id": 1447, "subject_name": "Mathematics", "class_section": 208, "assigned_teacher": 173 },
    { "id": 1455, "subject_name": "Mathematics", "class_section": 209, "assigned_teacher": 169 },
    { "id": 1463, "subject_name": "Mathematics", "class_section": 210, "assigned_teacher": 160 },
    { "id": 1472, "subject_name": "Mathematics", "class_section": 211, "assigned_teacher": 182 },
    { "id": 1391, "subject_name": "Mathematics", "class_section": 201, "assigned_teacher": 155 },
    { "id": 1386, "subject_name": "Physics", "class_section": 200, "assigned_teacher": 171 },
    { "id": 1410, "subject_name": "Physics", "class_section": 203, "assigned_teacher": 164 },
    { "id": 1442, "subject_name": "Physics", "class_section": 207, "assigned_teacher": 156 },
    { "id": 1466, "subject_name": "Physics", "class_section": 210, "assigned_teacher": 154 },
    { "id": 1426, "subject_name": "Physics", "class_section": 205, "assigned_teacher": 172 },
    { "id": 1354, "subject_name": "Physics", "class_section": 196, "assigned_teacher": 157 },
    { "id": 1402, "subject_name": "Physics", "class_section": 202, "assigned_teacher": 165 },
    { "id": 1394, "subject_name": "Physics", "class_section": 201, "assigned_teacher": 170 },
    { "id": 1418, "subject_name": "Physics", "class_section": 204, "assigned_teacher": 170 },
    { "id": 1370, "subject_name": "Physics", "class_section": 198, "assigned_teacher": 153 },
    { "id": 1450, "subject_name": "Physics", "class_section": 208, "assigned_teacher": 152 },
    { "id": 1458, "subject_name": "Physics", "class_section": 209, "assigned_teacher": 152 },
    { "id": 1434, "subject_name": "Physics", "class_section": 206, "assigned_teacher": 172 },
    { "id": 1362, "subject_name": "Physics", "class_section": 197, "assigned_teacher": 173 },
    { "id": 1378, "subject_name": "Physics", "class_section": 199, "assigned_teacher": 167 },
    { "id": 1270, "subject_name": "Science", "class_section": 182, "assigned_teacher": 174 },
    { "id": 1264, "subject_name": "Science", "class_section": 181, "assigned_teacher": 169 },
    { "id": 1312, "subject_name": "Science", "class_section": 189, "assigned_teacher": 161 },
    { "id": 1318, "subject_name": "Science", "class_section": 190, "assigned_teacher": null },
    { "id": 1300, "subject_name": "Science", "class_section": 187, "assigned_teacher": 159 },
    { "id": 1306, "subject_name": "Science", "class_section": 188, "assigned_teacher": 157 },
    { "id": 1473, "subject_name": "Science", "class_section": 196, "assigned_teacher": null },
    { "id": 1342, "subject_name": "Science", "class_section": 194, "assigned_teacher": 157 },
    { "id": 1348, "subject_name": "Science", "class_section": 195, "assigned_teacher": null },
    { "id": 1336, "subject_name": "Science", "class_section": 193, "assigned_teacher": 172 },
    { "id": 1276, "subject_name": "Science", "class_section": 183, "assigned_teacher": 168 },
    { "id": 1330, "subject_name": "Science", "class_section": 192, "assigned_teacher": 169 },
    { "id": 1282, "subject_name": "Science", "class_section": 184, "assigned_teacher": 157 },
    { "id": 1324, "subject_name": "Science", "class_section": 191, "assigned_teacher": 155 },
    { "id": 1294, "subject_name": "Science", "class_section": 186, "assigned_teacher": null },
    { "id": 1288, "subject_name": "Science", "class_section": 185, "assigned_teacher": 165 },
    { "id": 1319, "subject_name": "Social Studies", "class_section": 190, "assigned_teacher": 175 },
    { "id": 1349, "subject_name": "Social Studies", "class_section": 195, "assigned_teacher": 169 },
    { "id": 1343, "subject_name": "Social Studies", "class_section": 194, "assigned_teacher": 152 },
    { "id": 1337, "subject_name": "Social Studies", "class_section": 193, "assigned_teacher": 175 },
    { "id": 1265, "subject_name": "Social Studies", "class_section": 181, "assigned_teacher": 155 },
    { "id": 1331, "subject_name": "Social Studies", "class_section": 192, "assigned_teacher": 154 },
    { "id": 1313, "subject_name": "Social Studies", "class_section": 189, "assigned_teacher": 162 },
    { "id": 1307, "subject_name": "Social Studies", "class_section": 188, "assigned_teacher": 162 },
    { "id": 1325, "subject_name": "Social Studies", "class_section": 191, "assigned_teacher": null },
    { "id": 1301, "subject_name": "Social Studies", "class_section": 187, "assigned_teacher": 162 },
    { "id": 1295, "subject_name": "Social Studies", "class_section": 186, "assigned_teacher": 161 },
    { "id": 1289, "subject_name": "Social Studies", "class_section": 185, "assigned_teacher": 155 },
    { "id": 1283, "subject_name": "Social Studies", "class_section": 184, "assigned_teacher": 161 },
    { "id": 1277, "subject_name": "Social Studies", "class_section": 183, "assigned_teacher": 160 },
    { "id": 1271, "subject_name": "Social Studies", "class_section": 182, "assigned_teacher": 175 },
    { "id": 1401, "subject_name": "Urdu", "class_section": 202, "assigned_teacher": 167 },
    { "id": 1293, "subject_name": "Urdu", "class_section": 186, "assigned_teacher": 169 },
    { "id": 1317, "subject_name": "Urdu", "class_section": 190, "assigned_teacher": 153 },
    { "id": 1361, "subject_name": "Urdu", "class_section": 197, "assigned_teacher": 153 },
    { "id": 1457, "subject_name": "Urdu", "class_section": 209, "assigned_teacher": 171 },
    { "id": 1433, "subject_name": "Urdu", "class_section": 206, "assigned_teacher": 157 },
    { "id": 1323, "subject_name": "Urdu", "class_section": 191, "assigned_teacher": 162 },
    { "id": 1287, "subject_name": "Urdu", "class_section": 185, "assigned_teacher": 161 },
    { "id": 1377, "subject_name": "Urdu", "class_section": 199, "assigned_teacher": 169 },
    { "id": 1329, "subject_name": "Urdu", "class_section": 192, "assigned_teacher": 154 },
    { "id": 1263, "subject_name": "Urdu", "class_section": 181, "assigned_teacher": 155 },
    { "id": 1281, "subject_name": "Urdu", "class_section": 184, "assigned_teacher": 158 },
    { "id": 1465, "subject_name": "Urdu", "class_section": 210, "assigned_teacher": 167 },
    { "id": 1425, "subject_name": "Urdu", "class_section": 205, "assigned_teacher": 164 },
    { "id": 1269, "subject_name": "Urdu", "class_section": 182, "assigned_teacher": 166 },
    { "id": 1335, "subject_name": "Urdu", "class_section": 193, "assigned_teacher": 156 },
    { "id": 1275, "subject_name": "Urdu", "class_section": 183, "assigned_teacher": 153 },
    { "id": 1341, "subject_name": "Urdu", "class_section": 194, "assigned_teacher": 152 },
    { "id": 1369, "subject_name": "Urdu", "class_section": 198, "assigned_teacher": 173 },
    { "id": 1417, "subject_name": "Urdu", "class_section": 204, "assigned_teacher": 174 },
    { "id": 1393, "subject_name": "Urdu", "class_section": 201, "assigned_teacher": 167 },
    { "id": 1347, "subject_name": "Urdu", "class_section": 195, "assigned_teacher": 152 },
    { "id": 1385, "subject_name": "Urdu", "class_section": 200, "assigned_teacher": 161 },
    { "id": 1305, "subject_name": "Urdu", "class_section": 188, "assigned_teacher": 174 },
    { "id": 1353, "subject_name": "Urdu", "class_section": 196, "assigned_teacher": 165 },
    { "id": 1409, "subject_name": "Urdu", "class_section": 203, "assigned_teacher": 162 },
    { "id": 1449, "subject_name": "Urdu", "class_section": 208, "assigned_teacher": 159 },
    { "id": 1441, "subject_name": "Urdu", "class_section": 207, "assigned_teacher": 173 },
    { "id": 1311, "subject_name": "Urdu", "class_section": 189, "assigned_teacher": 173 },
    { "id": 1299, "subject_name": "Urdu", "class_section": 187, "assigned_teacher": 158 }
];

// --- Get Subject Name --------------------------------------------

export const getSubjectName = (id) => {
  const subject = SUBJECT_LIST.find((s) => s.id === id);
  return subject ? subject.subject_name : `Subject ${id}`;
};

// --- Get Class Name ---------------------------------------------

export const getClassName = (id) => {
  const classMap = {
    181: 'Class 6-A',
    182: 'Class 6-B',
    183: 'Class 7-A',
    184: 'Class 7-B',
    185: 'Class 8-A',
    186: 'Class 8-B',
    187: 'Class 9-A',
    188: 'Class 9-B',
    189: 'Class 10-A',
    190: 'Class 10-B',
    191: 'Class 6-C',
    192: 'Class 7-C',
    193: 'Class 8-C',
    194: 'Class 9-C',
    195: 'Class 10-C',
    196: 'Class 11-A',
    197: 'Class 11-B',
    198: 'Class 11-C',
    199: 'Class 12-A',
    200: 'Class 12-B',
    201: 'Class 12-C',
    202: 'Class 9-D',
    203: 'Class 10-D',
    204: 'Class 11-D',
    205: 'Class 12-D',
    206: 'Class 10-E',
    207: 'Class 11-E',
    208: 'Class 12-E',
    209: 'Class 11-F',
    210: 'Class 12-F',
    211: 'Class 8-D'
  };
  return classMap[id] || `Class ${id}`;
};

// --- Get Class ID from Subject ------------------------------------

export const getClassIdFromSubject = (id) => {
  const subject = SUBJECT_LIST.find((s) => s.id === id);
  return subject ? subject.class_section : null;
};
